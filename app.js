/*
    3 controllers: dataController, viewController, appController
    dataController: handles model
    viewController: handles UI
    appController: facilitator between other controllers, handles events & initialization
 */

var dataController = (function() {
    var allCards = ("10c,10d,10h,10s,2c,2d,2h,2s,3c,3d,3h,3s,4c,4d,4h,4s,5c,5d,5h,5s,6c,6d,6h," +
        "6s,7c,7d,7h,7s,8c,8d,8h,8s,9c,9d,9h,9s,Ac,Ad,Ah,As,Jc,Jd,Jh,Js,Kc,Kd,Kh,Ks,Qc,Qd,Qh,Qs").split(',');

    const NUM_CARDS_IN_HAND = 5;

    /**
     *
     * @param cards array of cards to go into hand
     * @constructor
     */
    var Hand = function(cardsArr){
        this.cards = cardsArr;
    };

    // /**
    //  * Given positions of cards, toggle their visibility (flipped or not)
    //  * @param cardPositions unique array of numbers in range (0 to NUM_CARDS_IN_HAND-1)
    //  */
    // Hand.prototype.toggleCard = function(cardPosition) {
    //     this.cards[cardPosition].visible = !this.cards[cardPosition].visible
    //     return this.cards[cardPosition].visible;
    // };

    // /**
    //  * Given a card position (int), return card object
    //  * @param cardPosition int from 0 to NUM_CARDS_IN_HAND-1
    //  */
    // Hand.prototype.getCard = function(cardPosition) {
    //     return this.cards[cardPosition];
    // };


    /**
     *
     * @constructor
     */
    var Deck = function(){
        this.newCards = allCards.sort(function(a,b){return 0.5 - Math.random()}); // put cards in random order
        this.usedCards = [];
    };

    /**
     * Given a number of cards, select them from the deck, add to usedCards list, and return list of  "drawn" cards
     * @param numCards int showing number of cards to draw
     */
    Deck.prototype.drawCards = function(numCards){
        var selectedCards = this.newCards.splice(0, numCards);
        this.usedCards = this.usedCards.concat(selectedCards);
        return selectedCards;
    };

    var data = {
        deck: new Deck(),
        hand: {}
    };

    return {
        drawCards: function(numCards){
            return data.deck.drawCards(numCards);
        },

        drawHand: function(){
            var cardsArr = data.deck.drawCards(NUM_CARDS_IN_HAND);
            data.hand = new Hand(cardsArr);
            return cardsArr;
        },

        removeFromHand: function(cardToDrop){
            if(data.hand.cards.indexOf(cardToDrop)<0){
                console.log(`Trying to drop ${cardToDrop}, which is not in hand!`);
                return false;
            } else {
                data.hand.cards = data.hand.cards.filter((card)=>card!=cardToDrop);
                return true;
            }
        },

        addToHand: function(newCard){
            if(data.hand.cards.length < NUM_CARDS_IN_HAND){
                data.hand.cards.push(newCard);
                return true;
            } else {
                console.log('Too many cards in hand');
                return false;
            }
        },

        numCards: function(){return NUM_CARDS_IN_HAND},

        // FOR DEBUGGING ONLY. TODO: REMOVE
        getData: function(){return data},

    }



})();

var viewController = (function() {
    var domStrings = {
        'card': '.card',
        'discard': '.unselected',
        'btnDeal': '#btn-deal',
        'btnDraw': '#btn-draw',
        'btnStand': '#btn-stand'
    };

    var showCard = function(cardDom, card){
        cardDom.classList.remove('blank');
        cardDom.classList.remove('unselected');
        cardDom.id = card;
        cardDom.firstElementChild.src = `img/cards/${card}.png`;
    };

    return {
        getDomStrings: function(){
            return domStrings;
        },

        displayCards: function(cards){
            var cardDoms = document.querySelectorAll(domStrings.card);
            for(let i = 0; i < cards.length; i++){
                showCard(cardDoms[i], cards[i]);
            }
        },

        displayNewCard: function(oldCard, newCard){
            var dom = document.getElementById(`${oldCard}`);
            showCard(dom, newCard);
        }
    };

})();

var appController = (function(dataCtrl, uiCtrl) {
    var dom = uiCtrl.getDomStrings();
    var numUnselected; // num cards deselected
    var hasDrawn; // flag for if already drawn (can only draw at most once/game)

    var setEventListeners = function() {
        // deal btn
        document.querySelector(dom.btnDeal).addEventListener('click', deal);

        //draw btn
        document.querySelector(dom.btnDraw).addEventListener('click', draw);

        // cards
        for(let card of document.querySelectorAll(dom.card)){
            card.addEventListener('click', () => clickCard(card));
        }
    };

    var deal = function(){
        // get new hand
        var drawnCards = dataCtrl.drawHand(); //array of card types
        console.log(drawnCards);

        // display 5 new cards
        uiCtrl.displayCards(drawnCards);

        // disable deal button, enable stand
        document.querySelector(dom.btnDeal).disabled = true;
        document.querySelector(dom.btnStand).disabled = false;
    };

    var draw = function(){
        if(!hasDrawn) {
            // get DOM of dropped cards
            var droppedCards = document.querySelectorAll(dom.discard);

            // data: get new cards
            var newCards = dataCtrl.drawCards(droppedCards.length);

            for(let i = 0; i< droppedCards.length; i++){
                // data: replace unselected cards from hand with new cards
                let droppedCard = droppedCards[i].id;
                dataCtrl.removeFromHand(droppedCard);
                dataCtrl.addToHand(newCards[i]);

                // view: show new cards
                uiCtrl.displayNewCard(droppedCard, newCards[i]);
            }

            document.querySelector(dom.btnDraw).disabled=true;
            hasDrawn = true;
        }

    };

    var clickCard = function(cardDom){
        if(!cardDom.classList.contains('blank') && !hasDrawn){
            cardDom.classList.toggle('unselected');

            // if unselected card, then can draw
            numUnselected = cardDom.classList.contains('unselected') ? numUnselected + 1 : numUnselected - 1;
            document.querySelector(dom.btnDraw).disabled =  !(numUnselected > 0)
        }
    };

    return {
        init: function(){
            // set up event listeers
            setEventListeners();

            // set starting parameters
            hasDrawn = false;
            numUnselected = 0;

            document.querySelector(dom.btnStand).disabled = true;
            document.querySelector(dom.btnDraw).disabled = true;


            console.log("initialized!");
        }
    }

})(dataController, viewController);

appController.init();