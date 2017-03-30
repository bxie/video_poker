// DATA STRUCTURES
class Deck {
    constructor() {
        let deck;

        // Shuffle deck
        this.shuffle = () => {
            for(let i = deck.length - 1; i > 0; i--) {
                let cur = deck[i];
                let rand = Math.floor(Math.random() * (i - 1));
                deck[i] = deck[rand];
                deck[rand] = cur;
            }
        };

        // Deal card(s), returns array of cards
        this.deal = (numCards = 1) => {
            let cards = [];
            for(let i = 0; i < numCards; i++) {
                cards.push(deck.pop());
            }
            return cards;
        };

        // Method to reset deck
        this.reset = () => {
            deck = ['Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc',
                'Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd',
                'Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh',
                'As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks'];
        };

        this.getDeck = () => deck;

        this.reset();
    }
}

class Hand {
    constructor() {
        let hand = [];

        // Method to add cards into hand, takes in an array of cards
        this.draw = (dealt) => dealt.forEach((cur) => hand.push(cur));

        // Method to remove cards from hand.
        this.discard = (card) => {
            let index = hand.indexOf(card);
            if(index > -1) {
                hand.splice(index, 1);
            }
        };

        this.empty = () => hand = [];

        // Getter method for hand.
        this.getCards = () => hand;
    }
}

// CONTROLLERS
class UiController {

    // Select cards for discard by marking them with toggled class.
    static toggleCard(id) {
        let element = document.getElementById(id);
        element.classList.toggle('toggled');
    }

    // Method to update card container with cards in hand.
    static updateHand(hand) {
        // Clear container
        document.querySelector(UiController.getDomStrings().cardContainer).innerHTML = "";

        // Insert cards from hand
        hand.forEach((cur) => {
            let html = `<div class="card" id="${cur}"><img src="img/cards/${cur}.png" /></div>`;
        document.querySelector(this.getDomStrings().cardContainer).insertAdjacentHTML('beforeend', html);
    });
    }

    // Display blank cards.
    static blankHand() {
        document.querySelector(this.getDomStrings().cardContainer).innerHTML = '<div class="card blank"><img src="img/blank_card.png" /></div><div class="card blank"><img src="img/blank_card.png" /></div><div class="card blank"><img src="img/blank_card.png" /></div> <div class="card blank"><img src="img/blank_card.png" /></div><div class="card blank"><img src="img/blank_card.png" /></div>';
    }

    // Method to get IDs of toggled cards.
    static getToggledCards() {
        let cards = [];
        // Get toggled elements
        let toggledElements = document.getElementsByClassName(this.getDomStrings().toggledClass);

        // Get IDs of toggled elements (IDs in card
        for(let i = 0; i < toggledElements.length; i++) {
            cards.push(toggledElements[i].id);
        }

        return cards;
    }

    // Method that toggles whether button is active, disabled is bool for whether button is disabled or not.
    static setButton(id, disabled) {
        let el = document.getElementById(id);
        el.disabled = (disabled === undefined ? !el.isDisabled : disabled);
    }

    // Method that returns object that stores DOM strings.
    static getDomStrings() {
        return {
            toggledClass: 'toggled',
            cardContainer: '.cards',
            discardBtnId: 'btn-discard',
            dealBtnId: 'btn-deal',
            betBtnId: 'btn-bet',
            startBtnId: 'btn-start'
        };
    }
}

class GameController {
    constructor() {
        let deck = new Deck();
        let hand = new Hand();

        this.roundStart = () => {
            deck.reset();
            hand.empty();
        };

        // Methods to interact with game data objects.
        this.deal = (numCards = 1) => hand.draw(deck.deal(numCards));
        this.getHandCards = () => hand.getCards();
        this.getDeck = () => deck.getDeck();
        this.shuffleDeck = () => deck.shuffle();
        this.discard = (card) => hand.discard(card);
    }
}

class Controller {
    constructor(gameController) {
        let gameCtrl = gameController;
        /*
         const MIN_BET = 25;

         let pot = 0;
         let credit = 0;
         */

        const STATES = {
            INIT: 0,        // Waiting for user to insert money, update credit, update UI
            GAME_START: 1,  // Waiting for user to bet money, update credit and pot, update UI
            ROUND_START: 2, // Deal cards, update UI
            ROUND_PLAY: 3,  // Play round
            SCORING: 4,     // Score, display score, update credit
            ROUND_END: 5    // Cont?
        };

        let state = STATES.INIT;
        this.execute = function () {
            switch (state) {
                case STATES.INIT:
                    UiController.blankHand();
                    UiController.setButton(UiController.getDomStrings().dealBtnId, true);
                    UiController.setButton(UiController.getDomStrings().discardBtnId, true);
                    UiController.setButton(UiController.getDomStrings().betBtnId, true);
                    break;
                case STATES.GAME_START:
                    gameCtrl.roundStart();
                    UiController.setButton(UiController.getDomStrings().startBtnId, true);
                    UiController.setButton(UiController.getDomStrings().dealBtnId, false);
                    UiController.setButton(UiController.getDomStrings().discardBtnId, true);
                    UiController.setButton(UiController.getDomStrings().betBtnId, true);
                    break;
                case STATES.ROUND_PLAY:
                    UiController.setButton(UiController.getDomStrings().dealBtnId, true);
                    UiController.setButton(UiController.getDomStrings().betBtnId, false);
                    UiController.setButton(UiController.getDomStrings().discardBtnId, false);
                    break;
                default:
                    state = STATES.GAME_START;
                    this.execute();
            }
        };

        // Setup event listeners
        this.setupListeners = function () {
            // Event for toggling cards.
            document.querySelector(UiController.getDomStrings().cardContainer).addEventListener('click', (event) => {
                if(state !== STATES.ROUND_PLAY) return;
            let id = event.target.parentNode.id;
            if(id.length > 0) {
                UiController.toggleCard(id);
            }
        });

            // TODO: Add credits
            document.getElementById(UiController.getDomStrings().startBtnId).addEventListener('click', () => {
                state = STATES.GAME_START;
            this.execute();
        });

            // Event for dealing cards at round start.
            document.getElementById(UiController.getDomStrings().dealBtnId).addEventListener('click', () => {
                gameCtrl.shuffleDeck();
            gameCtrl.deal(5);
            UiController.updateHand(gameCtrl.getHandCards());
            // state = STATES.GAME_START;
            state = STATES.ROUND_PLAY;
            this.execute();
        });

            // TODO Event for bet button.
            document.getElementById(UiController.getDomStrings().betBtnId).addEventListener('click', () => {
                // Remove money from player

                // Add money to pot

                // Update UI

            });

            // Event for discard button.
            document.getElementById(UiController.getDomStrings().discardBtnId).addEventListener('click', () => {
                // Get toggled elements
                let toggledCards = UiController.getToggledCards();

            // Discard toggled cards from hand
            toggledCards.forEach((cur) => {
                gameCtrl.discard(cur);
        });

            // Deal cards to replace discard
            gameCtrl.deal(toggledCards.length);
            UiController.updateHand(gameCtrl.getHandCards());

            state = STATES.SCORING;
            this.execute();
        });
        };

        // TODO DEBUGGING PURPOSES ONLY!
        this.testing = () => {
            console.log(gameController.getDeck());
            console.log(gameController.getHandCards());
        };
    }

    init() {
        this.setupListeners();
        this.execute();
    }
}

controller = new Controller(new GameController());
controller.init();