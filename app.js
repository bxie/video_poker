/*
* Created 2017
* A video poker game created in colaboration with Shelton and Benji. Most of this code was
* created by Justin Tu, however some parts may have come from Shelton or Benji.
*
* Uses the Knuth Shuffle as referenced at 		
* http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array   * The Knuth Shuffle as referenced at https://git.daplie.com/Daplie/knuth-shuffle
*/

const HAND_SIZE = 5;

//Shortcut function for document.querySelector(selector)
var qs = function(ele) {
	return document.querySelector(ele);
}

//Shortcut function for document.getElementById(id)
var dg = function(id) {
	return document.getElementById(id);
}

var PokerModel = (function(){
	var deck = [];
	
	/*
	* Empties and then fills the deck with 52 standard cards. i.e. 4 sets 2 - 9, jacks, 
	* queens, kings, and aces. Where each set has either the clubs,
	* clovers, hearts, and spades suit.
	*/
	var fillDeck = function(){
		deck = [];
		var suits = ["c","d","h","s"]; //Clubs, diamonds, hearts, spades
		for(var c = 0; c < 4; c++) {
			for (var i = 2; i <= 9; i++) {
				deck.push(i + suits[c]);
			}
			deck.push("J" + suits[c]);
			deck.push("Q" + suits[c]);
			deck.push("K" + suits[c]);
			deck.push("A" + suits[c]);
		}
	}
	
	

	return {
		/*
		* Draws a user given number of cards from the deck and returns the 
		* drawn cards in an array.
		* NOTE: Deck can run out of cards, so consider a way to add more 
		* cards into the deck.
		*/
		drawCards: function(numCards) {
			var arr = [];
			for(var i = 0; i < numCards; i++){
				arr.push(deck.shift());
			}
			return arr;
		},
		
		//Returns the current deck
		getDeck:function(){
			return deck;
		},
		
		/*
		* Initalizes the PokerModel by filling the deck and then shuffling 
		* it.
		*/
		init: function(){
			fillDeck();
			deck = this.shuffle(deck);
		},
		
		/*
		* Shuffles an array of elements using the Knuth Shuffle.
		* Source :
		* http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array   
		* The Knuth Shuffle as referenced at https://git.daplie.com/Daplie/knuth-shuffle
		*/
		shuffle: function(array) {
			var currentIndex = array.length, temporaryValue, randomIndex;
			 
			while (0 !== currentIndex) {       
			     
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;       
			    
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
			}
			return array;
		},
	}
})();

/*
* Handles UI updating for the Poker Videogame
*/
var PokerView = (function(){
	var ref = {
		cardList: ".cards",
		
		//Score Class selectors
		bankScore: ".bank",
		betScore: ".bet",
		handScore: ".hand",
		
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
			var hand = document.querySelectorAll(".card");
			for(var i = 0; i < hand.length; i ++){
				//img child node is assumed to be at index 1
				hand[i].childNodes[1].src = "img/blank_card.png";
			}
			console.log("Discarded Hand");
		},
		
		/*
		* Returns the reference list of class and id identifiers for elements
		* in the index.html
		*/
		getRef: function(){
			return ref;
		},
		
		/*
		* Updates the hand by discarding any cards the player has choosen, and 
		* dealing out new cards. If no cards are choosen, then an entirely new 
		* hand is given out. 
		* The new cards are passed in via the parameter newCards.
		* IN PROGRESS (Does not check player's choosen cards and discards entire hand)
		*/
		updateHand: function(newCards) {
			var hand = document.querySelectorAll(".card");
			for (var i = 0; i < hand.length; i++){
				//img child node is assumed to be at index 1
				hand[i].childNodes[1].src = "img/cards/" + newCards[i] + ".png";
			}
		},
	};
})();

/*
* Handles events and user input for the Poker Videogame
*/
var PokerAdapter = (function(){
	
	//Initalize Event Listeners for Video Poker game
	var setupListeners = function(){
		var ref = PokerView.getRef();
		qs(ref.cardList).addEventListener("click", toggleCard);
		//dg(ref.betBtnId).addEventListener("click", increaseBet);
		//dg(ref.dealBtnId).addEventListener("click", dealCards);
		dg(ref.drawBtnId).addEventListener("click", drawCards);
		dg(ref.standBtnId).addEventListener("click", standHand);
		
	};
	
	
	
	/*
	* A callback function for when the user clicks on the draw cards button. This
	* function signals the model and view to deal the user new cards.
	*/
	var dealCards = function(){
		console.log("Deal Cards");
	}
	
	/*
	* A callback function for when the user clicks on the draw button. This function
	* signals the model and view to begin drawing cards for play.
	*/
	var drawCards = function() {
		PokerView.updateHand(PokerModel.drawCards(HAND_SIZE));
		console.log("Drawing cards");
	}
	
	/*
	* A callback function for when the user clicks on the bet button. Signals the 
	* model and view that the user has increased their current bet.
	*/
	var increaseBet = function(){
		console.log("Increase Bet");
	}
	
	/*
	* A callback function for when the user clicks on the stand button. This function 
	* will signal to the model and view that the user has accepted their current
	* hand.
	*/
	var standHand = function() {
		console.log("Stand on hand.");
	}
	
	/*
	* A callback function for when a poker card is clicked. This function toggles a 
	* card for discard or keeping.  
	*/
	var toggleCard = function(event){
		console.log("Toggle Card");
	}
	
	return {
		init: function() {
			setupListeners();
			PokerModel.init();
		},
	}
})();

PokerAdapter.init();