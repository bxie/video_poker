/*
* Created 2017
* A video poker game created in colaboration with Shelton Tso and Benji Xie. Most of this code was
* created by Justin Tu. 
*
*
* Uses the Knuth Shuffle as referenced at 		
* http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array   
* and at https://git.daplie.com/Daplie/knuth-shuffle
* Credit to Daplie under Apache License 2.0
*
*
* Also uses GitHub project pokersolver at https://github.com/goldfire/pokersolver
* Copyright (c) 2016 James Simpson and GoldFire Studios, Inc.
* Released under the MIT License.
*/

const GAME_TYPE = "jacksbetter"; //Game type for use with pokersolver's solve() function
const HAND_SIZE = 5;//Default number of cards for a hand
const MAX_BET = 5;//Maximum bet size for the player
const START_MONEY = 100;//Amount of starting money for a new player

//Bet multipler returns for each type of hand
const PAIR = 1;
const TWO_PAIRS = 2;
const THREE_KIND = 3;
const STRAIGHT = 4;
const FLUSH = 5;
const FULL_HOUSE = 9;
const FOUR_KIND = 25;
const STRAIGHT_FLUSH = 50;
const ROYAL_FLUSH = 250;

//Shortcut function for document.querySelector(selector)
var qs = function(ele) {
	return document.querySelector(ele);
}

//Shortcut function for document.getElementById(id)
var dg = function(id) {
	return document.getElementById(id);
}


/**
* This Model is in charge of storing, managing, and modifying the game's pieces.
* It stores the deck of cards, the player's current hand, the player's current bet,
* the player's current bank, and which cards they are holding onto for the round.
* It has functions for managing these variables. It also has functions for determining
* the player hand's value; these rely on pokersolver.
*/
var PokerModel = (function(){
	var deck = []; //Deck of cards 
	var hand = []; //Player's hand
	var held = []; //Cards in hand that the player wants to hold onto
	var bank = START_MONEY; //Amount of money the player has won so far
	var currentBet = 0;//Amount of money the player is betting for this round
	
	/*
	* Empties and then fills the deck with 52 standard cards. i.e. 4 sets of 2 - 10, jacks, 
	* queens, kings, and aces. Where each set has either clubs, clovers, hearts, or spades 
	* suit.
	*
	* Cards are stored in a special (card value)(card suit) format used in pokersolver.
	* EX. 2c = 2 of clubs; Ts = 10 of spades; Jh = Jack of hearts; Ad = Ace of diamonds
	*/
	var fillDeck = function(){
		deck = [];
		var suits = ["c","d","h","s"]; //Clubs, diamonds, hearts, spades
		for(var c = 0; c < 4; c++) {
			for (var i = 2; i <= 9; i++) {
				deck.push(i + suits[c]);
			}
			deck.push("T" + suits[c]); //Tens			
			deck.push("J" + suits[c]);
			deck.push("Q" + suits[c]);
			deck.push("K" + suits[c]);
			deck.push("A" + suits[c]);
		}
	}
	
	/*
	* Shuffles an array of elements using the Knuth Shuffle. Credit to Daplie for
	* Knuth shuffle.
	* Source :
	* https://git.daplie.com/Daplie/knuth-shuffle
	* http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array   
	*/
	var shuffle = function(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		 
		while (0 !== currentIndex) {       
			 
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;       
			
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
		}
		return array;
	}

	return {
		/*
		* Discards cards from the player's hand that are not selected for
		* holding and returns the number of discarded cards. Also resets
		* the player's held cards.
		*/
		discardCards: function(){
			var count = 0;
			for(var i = 0; i < HAND_SIZE; i++) {
				if(held.indexOf(hand[i]) < 0) {
					hand[i] = "blank_card";
					count++;
				}
			}
			held = [];
			return count;
		},
		
		/*
		* Draws enough cards from the deck to completely fill the user's hand
		* If the deck is empty or the hand is full then no cards are drawn.
		*/
		drawCards: function() {
			var i = 0;
			if(hand.length == 0) {
				for(var i = 0; i < HAND_SIZE; i++){
					var c = deck.shift();
					hand.push(c);
				}
			} else {
				for(var i = 0; i < HAND_SIZE; i++){
					var c = deck.shift();
					var j = hand.indexOf("blank_card");
					//var j = hand.findIndex((ele) => {return (ele == null || ele == "blank_card");});
					hand[j] = c;
				}
			}
			
			return hand;
		},
		
		//Returns the player's current bank
		getBank: function(){
			return bank;
		},
		
		//Return's the player's current bet
		getBet: function(){
			return currentBet;
		},
		
		//Returns an array of the current deck
		getDeck:function(){
			return deck;
		},
		
		//Returns an array of the player's current hand
		getHand: function(){
			return hand;
		},
		
		//Returns an array of the player's held cards
		getHeld: function(){
			return held;
		},
		
		/*
		* Uses pokersolver to find the grade of the player's hand and
		* returns how much money the player will earn.
		*/
		gradeHand: function(){
			var result = Hand.solve(hand, GAME_TYPE, true);
			switch(result.rank) {				
				case 2:// Pair
					var checkJacks = (result) => {
						var tmp = result.descr.split("'");
						tmp = tmp[0].charAt(tmp[0].length - 1);
						return isNaN(Number(tmp));
					};
					if(checkJacks(result)) {
						return PAIR * currentBet;
					} else {
						return 0;
					}
				break;
				
				case 3://2 Pairs
					return TWO_PAIRS * currentBet;
				break;
				
				case 4://3 of a kind
					return THREE_KIND * currentBet;
				break;
				
				case 5://Straight
					return STRAIGHT * currentBet;
				break;
				
				case 6: //Flush
					return FLUSH * currentBet;
				break;
				
				case 7: //Full House
					return FULL_HOUSE * currentBet;
				break;
				
				case 8: //Four of a kind
					return FOUR_KIND * currentBet;
				break;
				
				case 9://Straight Flush 
				//NOTE: Pokersolver doesn't check for Royal Flushes in jacks or better
					if (result.descr === "Royal Flush") {
						return ROYAL_FLUSH * currentBet;
					} else {
						return STRAIGHT_FLUSH * currentBet;
					}
					
				break;
				
				default:
				return 0;
				break;
			}
		},
		
		/*
		* Raises the player's current bet by 1. The current bet
		* cannot exceed the maximum bet: Default = 5;
		* Returns true if bet is succesfully increased,
		* Returns false otherwise.
		*/
		increaseBet: function(){
			if(currentBet < 5) {
				currentBet ++;
				return true;
			} else {
				//console.log("Bet is currently at max");
				return false;
			}
		},
		
		/*
		* Initalizes the PokerModel by filling the deck, and then shuffling 
		* it; setting the player's bank to the default starting amount 
		* (100); and setting the player's bet to 0. Can also be used to reset
		* the PokerModel to its initial state.
		*/
		init: function(){
			fillDeck();
			deck = shuffle(deck);
			bank = START_MONEY;
			held = [];
			for(var i = 0; i < HAND_SIZE; i++){
				hand[i] = "blank_card";
			}
			bet = 0;
		},
		
		//Resets the Player's current bet to 0
		resetBet: function() {
			currentBet = 0;
		},
		
		//Creates a new, shuffled deck for the model.
		resetDeck: function() {
			fillDeck();
			deck = shuffle(deck);
		},
		
		//Resets the player's current held cards to nothing.
		resetHeld: function(){
			held = [];
		},
		
		/*
		* Sets the player's bank to a given value. Does not change 
		* the player's bank if the provided value is not a number.
		* Returns true on successful change. 
		* Returns false on unsuccessful change.
		*/
		setBank: function(value){
			if(!isNaN(value)) {
				bank = value;
				return true;
			} else {
				return false;
			}
		},

		/*
		* Toggles a card between being held or meant for discard. Cards are 
		* passed in as a String. The toggled card must be from the player's 
		* hand. A card that is meant for discard will be removed from the
		* player's hand using the discardCards() function.
		*
		* Strings passed in should be formatted in (card value)(card suit)
		* format. 
		* EX. 2c = 2 of clubs; Ts = 10 of spades; Jh = Jack of hearts; Ad = Ace of diamonds
		*
		* Returns false if the function is passed in null
		* Returns true if the function succeeded in toggling a card
		*/
		toggleCard: function(id) {
			if(id === null) {
				console.log("ERROR: Given null for card id")
				return false
			}
			if(hand.indexOf(id) < 0) {
				console.log("ERROR: Attempted to toggle card not in hand.");
				return ;
			}
			var i = held.indexOf(id);
			if(i >= 0) {
				held.splice(i, 1);
			} else {
				held.push(id);
			}
			return true;
		},
		
		
	}
})();

/**
* Handles UI elements for the Poker Videogame. These include the cards shown
* the bet, bank, and hand scores.
*/
var PokerView = (function(){
	//Reference list for DOM elements
	var ref = {
		cardList: ".cards",//Div holding all card divs
		card: ".card",//A div holding a card
		
		//Score IDs
		bankScore: "bank",
		betScore: "bet",
		handScore: "hand",
		
		//Button IDs
		betBtnId: "btn-bet",
		dealBtnId: "btn-deal",
		drawBtnId: "btn-draw",
		standBtnId: "btn-stand",
	};
	

	return {
		/*
		* Clears the hand of all cards by setting each card in the hand
		* to a blank card
		*/
		clearHand: function(){
			var hand = document.querySelectorAll(ref.card);
			for(var i = 0; i < hand.length; i ++){
				//img child node is assumed to be at index 1
				hand[i].childNodes[1].src = "img/blank_card.png";
			}
			//console.log("Discarded Hand");
		},
		
		/*
		* Returns the reference list of class and id identifiers for elements
		* in the index.html
		*/
		getRef: function(){
			return ref;
		},
		
		//Resets the player's hand so that it is no longer selected
		resetSelections: function(){
			var hand = document.querySelectorAll(ref.card);
			for(var i = 0; i < hand.length; i ++){
				//img child node is assumed to be at index 1
				hand[i].classList.remove("selected");
			}
		},
		
		/*
		* Checks if a given element corresponsds to a card in the player's hand. If 
		* the given element is a card in the player's hand then the corresponding 
		* card will have the CSS "selected" toggled and the function returns true. 
		* Otherwise, the function just returns false.
		*/
		selectCard: function(ele){
			if(ele.tagName !== "IMG") {
				return false;
			}
			var hand = document.querySelectorAll(ref.card);
			for (var i = 0; i < hand.length; i++){
				if(hand[i].childNodes[1].src == ele.src) {
					hand[i].classList.toggle("selected");
					return true;
				}
			}
			return false;
		},
		
		/*
		* Updates the player's current bank to a new, given value. This 
		* function will not update the player's bank if the given value
		* does not translate into a number.
		* EX: Accepted values = "15", '36', 9
		* Unacceptable Values = true, "ten", "what"
		*/
		updateBank: function(value){
			if(!isNaN(value)) {
				dg(ref.bankScore).innerHTML = value;
			}
		},
		
		/*
		* Updates the player's current bet to a new, given value. This 
		* function will not update the player's bet if the given value
		* does not translate into a number.
		* EX: Accepted values = "15", '36', 9
		* Unacceptable Values = true, "ten", "what"
		*/
		updateBet: function(value){
			if(!isNaN(value)) {
				dg(ref.betScore).innerHTML = value;
			}
		},
		
		/*
		* Updates the hand by discarding any cards the player has choosen, and 
		* dealing out new cards. If no cards are choosen, then an entirely new 
		* hand is given out. 
		* The new cards are passed in via the parameter newCards.
		*/
		updateHand: function(newCards) {
			var hand = document.querySelectorAll(ref.card);
			for (var i = 0; i < hand.length; i++){
				//img child node is assumed to be at index 1
				var root = "img/";
				if(newCards[i] != "blank_card") {
					root = root.concat("cards/");
				}
				hand[i].childNodes[1].src = root + newCards[i] + ".png";
			}
		},

		/*
		* Updates the player's hand score to a new, given value. This 
		* function will not update the player's score if the given value
		* does not translate into a number.
		* EX: Accepted values = "15", '36', 9
		* Unacceptable Values = true, "ten", "what"
		*/
		updateScore: function(newScore) {
			if(!isNaN(newScore)) {
				var score = dg(ref.handScore).innerHTML = newScore;
			}
		},
		
	};
})();

/**
* Handles events and user input for the Poker Videogame and calls upon the View 
* and Model under the appropriate situations.
*/
var PokerAdapter = (function(){
	
	/* 
	* State variable for determining current status of the game.
	* 0 = Before round start/End of round
	* 1 = Playing but have not stood on hand and not drawn new cards
	* 2 = Playing and already drawn extra cards but not stood on hand
	*/
	var state = 0;
	

	
	/*
	* A callback function for when the user clicks on the draw button. This 
	* function will start a new round at state 0 or draw new cards for the
	* player at state 1. At state 2, a message is sent to the player 
	* explaining that they cannot draw new cards.
	*
	* List of States:
	* 0 = Before round start/End of round
	* 1 = Playing but have not stood on hand and not drawn new cards
	* 2 = Playing and already drawn extra cards but not stood on hand
	*/
	var drawCards = function() {		
		if (PokerModel.getBet() <= 0) {
			alert("You must bet at least 1 in order to play a round");
		} else {
			if(state === 0) {
				//console.log("New Round!");
				PokerModel.resetDeck();
				PokerModel.setBank(PokerModel.getBank() - PokerModel.getBet());
				PokerView.updateBank(PokerModel.getBank());
				PokerView.updateScore(0);
			}			
			if(state === 0 || state === 1) {
				PokerModel.discardCards();
				PokerView.updateHand(PokerModel.drawCards());
				PokerView.resetSelections();
				state++;
			} else if (state === 2) {
				alert("You've already drawn a set of new cards this round.");
			}
		} 
		
		//console.log("Drawing cards");
	};
	
	/*
	* Helper funcction that checks if a given element represents a playing 
	* card image. If the element does, then the function will extract the 
	* playing card value from the card. If not, then the function returns
	* null. Returned card* values are Strings.
	*/
	var extractCardValue = function(card){
		if(card.tagName === "IMG") {
			var arr = card.src.split("/");
			var img = arr[arr.length - 1];
			img = img.split(".");
			return img[0];
		}
		return null;
	};
	
	/*
	* A callback function for when the user clicks on the bet button. Signals the 
	* model and view that the user has increased their current bet. The player
	* can only increase their bet before a game round starts and only as high
	* as the model allows the player. This function also alerts the player when
	* they try to increase the bet and aren't allowed to.
	*/
	var increaseBet = function(){
		if(state === 0) {
			if(!PokerModel.increaseBet()) {
				alert("You have reached the maximum bet!");
			}
			PokerView.updateBet(PokerModel.getBet());
			console.log("Increase Bet");
		} else {
			alert("You cannot increase your bet during a round.")
		}
	}
	
	//Initalize Event Listeners for Video Poker game
	var setupListeners = function(){
		var ref = PokerView.getRef();
		qs(ref.cardList).addEventListener("click", toggleCard);
		dg(ref.betBtnId).addEventListener("click", increaseBet);
		dg(ref.drawBtnId).addEventListener("click", drawCards);
		dg(ref.standBtnId).addEventListener("click", standHand);
		
	};
	
	/*
	* A callback function for when the user clicks on the stand button. This function 
	* will signal to the model and view that the user has accepted their current
	* hand. This function will do nothing if the game is not in play.
	*/
	var standHand = function() {
		if(state > 0) {
			var result = PokerModel.gradeHand();
			var hand = Hand.solve(PokerModel.getHand(), GAME_TYPE).descr;
			PokerModel.setBank(PokerModel.getBank() + result);
			PokerView.resetSelections();
			PokerModel.resetBet();
			PokerModel.resetHeld();
			PokerView.updateBet(PokerModel.getBet());
			PokerView.updateBank(PokerModel.getBank());
			if (result === 0) {
				alert("Sorry. You lost your bet. Play again by setting a new Bet and Drawing new cards")
			} else {
				PokerView.updateScore(result);
				alert(`You earned ${result} with a ${hand}! Play again by setting a new Bet and then Drawing new cards`);
			}
			state = 0;
		} else {
			alert("You can only stand on your hand during a round and only once per round.")
		}
	};
	
	/*
	* A callback function for when a poker card is clicked. This function toggles a 
	* card for discard or keeping. The player can only toggle cards on their first
	* set of cards in a round.
	*/
	var toggleCard = function(event){
		if(state === 1) {
			PokerView.selectCard(event.target);
			PokerModel.toggleCard(extractCardValue(event.target));
		} 
	};
	
	return {
		getState:function(){
			return state;
		},
		
		init: function() {
			setupListeners();
			PokerModel.init();
			PokerView.updateHand(PokerModel.getHand());
			PokerView.updateBet(PokerModel.getBet());
			PokerView.updateBank(PokerModel.getBank());
			alert(`Click on Bet to increase your bet and then press Draw to start a new round. Once a round you can select cards you want to keep and draw new cards to replace the ones you didn't select. Stand on your cards to see how much you'll earn. \nYou must bet at least 1 to start. ${MAX_BET} is the maximum bet.`);
		},
	}
})();

PokerAdapter.init();