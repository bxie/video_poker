/////////////////////
// DATA STRUCTURES //
/////////////////////


class GameDeck {
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
            deck = ['Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc',
                'Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd',
                'Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh',
                'As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks'];
        };

        this.getDeck = () => deck;

        // Set deck initially.
        this.reset();
    }
}

class PlayerHand {
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

        // Method for getting hand type.
        this.getHandType = () => {
            let type = Hand.solve(hand);
            // Make sure pair is Jack or better.
            if(type.name === "Pair" && type.cards[0].rank < 10) {
                return null;
            }
            // Check if royal flush
            if(type.name === "Straight Flush" && type.descr === "Royal Flush") {
                return "Royal Flush";
            }
            return type.name;
        }
    }
}


/////////////////
// CONTROLLERS //
/////////////////


class UiController {

    // Select cards for discard by marking them with toggled class.
    static toggleCard(id) {
        let element = document.getElementById(id);
        element.classList.toggle('toggled');
    }

    // Method to set container with cards in hand.
    static setHand(hand) {
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

    // Method that sets whether button is disabled
    static disableButton(id, disabled) {
        let el = document.getElementById(id);
        // Toggle if no bool is given
        el.disabled = disabled;
    }

    static setCreditText(credits) {
        document.getElementById(this.getDomStrings().bankAmtId).textContent = credits;
    }

    static setBetText(bet) {
        document.getElementById(this.getDomStrings().betMultiId).textContent = bet;
    }

    static setHandScoreText(score) {
        document.getElementById(this.getDomStrings().handScoreId).textContent = score;
    }

    // Method that returns object that stores DOM strings.
    static getDomStrings() {
        return {
            toggledClass: 'toggled',
            cardContainer: '.cards',
            discardBtnId: 'btn-discard',
            dealBtnId: 'btn-deal',
            betBtnId: 'btn-bet',
            startBtnId: 'btn-start',
            contBtnId: 'btn-cont',
            endBtnId: 'btn-end',
            bankAmtId: 'bank',
            betMultiId: "bet",
            handScoreId: "hand"
        };
    }
}

class GameController {
    constructor(minBet = 1, maxMulti = 5) {
        const MIN_BET = minBet;
        const MAX_BET_MULTI = maxMulti;
        let betMulti = 1;

        let gameDeck = new GameDeck();
        let gameHand = new PlayerHand();
        let credit = 0;

        // Map of score multipliers.
        let scoreMap = {
            "Pair": 1,
            "Two Pair": 2,
            "Three of a Kind": 3,
            "Straight": 10,
            "Flush": 5,
            "Full House": 6,
            "Four of a Kind": 25,
            "Straight Flush": 50,
            "Royal Flush": 250
        };

        // Method for resetting hand and deck.
        this.roundStart = () => {
            gameDeck.reset();
            gameDeck.shuffle();
            gameHand.empty();
        };

        // Method for resetting initial values
        this.reset = () => {
            betMulti = 1;

            gameDeck = new GameDeck();
            gameHand = new PlayerHand();
            credit = 0;
        };

        // Methods to interact with game data objects.
        this.deal = (numCards = 1) => gameHand.draw(gameDeck.deal(numCards));
        this.getHandCards = () => gameHand.getCards();
        this.getDeck = () => gameDeck.getDeck();
        this.shuffleDeck = () => gameDeck.shuffle();
        this.discard = (card) => gameHand.discard(card);

        // Methods to deal with player values.
        this.insertCredit = (credits = 100) => credit += credits;
        this.getCredits = () => credit;
        this.removeCredit = () => credit -= betMulti * MIN_BET;
        this.getBet = () => betMulti * MIN_BET;
        this.getMinBet = () => MIN_BET;
        this.increaseBetMulti = () => {
            // Raise multi till max then reset.
            betMulti = betMulti < MAX_BET_MULTI ? betMulti + 1 : 1;
            // Reset if not enough credits to cover bet.
            if(betMulti * MIN_BET > credit) betMulti = 1;
            return betMulti;
        };

        this.enoughCredits = () => MIN_BET <= credit;

        // Scoring methods
        this.getScoreMulti = () => scoreMap[gameHand.getHandType()] ? scoreMap[gameHand.getHandType()] : 0;
        // Add winnings.
        this.scoreRound = () => credit += betMulti * MIN_BET * this.getScoreMulti();
    }
}

class Controller {
    constructor(gameController) {
        let gameCtrl = gameController;
        const DOM = UiController.getDomStrings();

        const STATES = {
            INIT: 0,        // Waiting for user to insert money, update credit, update UI
            GAME_START: 1,  // Waiting for user to bet money, update credit and pot, update UI, deal cards, update UI
            ROUND_PLAY: 2,  // Play round
            SCORING: 3,     // Score, display score, update credit, ask if user wants to continue.
        };

        let state = STATES.INIT;

        // State machine sets basic UI elements and game operations for each state.
        this.execute = function () {
            switch (state) {
                case STATES.INIT: // Waiting for user to insert money, update credit, update UI
                    // Reset game controller.
                    gameCtrl.reset();
                    // Set initial UI variables.
                    UiController.setHandScoreText(0);
                    UiController.setBetText(1);
                    UiController.setCreditText(0);
                    UiController.blankHand();
                    // Set available buttons
                    UiController.disableButton(DOM.startBtnId, false);
                    UiController.disableButton(DOM.dealBtnId, true);
                    UiController.disableButton(DOM.discardBtnId, true);
                    UiController.disableButton(DOM.betBtnId, true);
                    UiController.disableButton(DOM.contBtnId, true);
                    UiController.disableButton(DOM.endBtnId, true);
                    break;
                case STATES.GAME_START: // Waiting for user to bet money, update credit and pot, update UI
                    gameCtrl.roundStart();
                    UiController.blankHand();
                    UiController.setHandScoreText(0);
                    // Set available buttons
                    UiController.disableButton(DOM.startBtnId, true);
                    UiController.disableButton(DOM.dealBtnId, false);
                    UiController.disableButton(DOM.discardBtnId, true);
                    UiController.disableButton(DOM.contBtnId, true);
                    UiController.disableButton(DOM.endBtnId, true);
                    UiController.disableButton(DOM.betBtnId, false);
                    break;
                case STATES.ROUND_PLAY: // Play round
                    // Set available buttons
                    UiController.disableButton(DOM.dealBtnId, true);
                    UiController.disableButton(DOM.betBtnId, true);
                    UiController.disableButton(DOM.discardBtnId, false);
                    break;
                case STATES.SCORING: // Score, display score, update credit, ask if user wants to continue.
                    gameCtrl.scoreRound();
                    UiController.setCreditText(gameCtrl.getCredits());
                    // Set available buttons
                    UiController.disableButton(DOM.discardBtnId, true);
                    UiController.disableButton(DOM.endBtnId, false);
                    if(gameCtrl.enoughCredits()) // Check if enough credits are available.
                        UiController.disableButton(DOM.contBtnId, false);
                    break;
                default:
                    state = STATES.INIT;
                    this.execute();
            }
        };

        // Setup event listeners
        this.setupListeners = function () {
            // Event for toggling cards.
            document.querySelector(DOM.cardContainer).addEventListener('click', (event) => {
                if(state !== STATES.ROUND_PLAY) return;
                let id = event.target.parentNode.id;
                if(id.length > 0) {
                    UiController.toggleCard(id);
                }
            });

            // Add credits to start game.
            document.getElementById(DOM.startBtnId).addEventListener('click', () => {
                state = STATES.GAME_START;
                // Add money
                gameCtrl.insertCredit();
                UiController.setCreditText(gameCtrl.getCredits());

                this.execute();
            });

            // Event for dealing cards and deducting money at round start.
            document.getElementById(DOM.dealBtnId).addEventListener('click', () => {
                // Cards
                gameCtrl.deal(5);
                UiController.setHand(gameCtrl.getHandCards());
                UiController.setHandScoreText(gameCtrl.getBet() * gameCtrl.getScoreMulti());

                // Credits
                gameCtrl.removeCredit();
                UiController.setCreditText(gameCtrl.getCredits());

                // state = STATES.GAME_START;
                state = STATES.ROUND_PLAY;
                this.execute();
            });

            // Event for changing bet.
            document.getElementById(DOM.betBtnId).addEventListener('click', () => {
                // Change bet multiplier
                gameCtrl.increaseBetMulti();
                // Update UI
                UiController.setBetText(gameCtrl.getBet());

            });

            // Event for discard button.
            document.getElementById(DOM.discardBtnId).addEventListener('click', () => {
                // Get toggled elements
                let toggledCards = UiController.getToggledCards();

                // Discard toggled cards from hand
                toggledCards.forEach((cur) => {
                    gameCtrl.discard(cur);
                });

                // Deal cards to replace discard
                gameCtrl.deal(toggledCards.length);
                UiController.setHand(gameCtrl.getHandCards());
                UiController.setHandScoreText(gameCtrl.getBet() * gameCtrl.getScoreMulti());

                state = STATES.SCORING;
                this.execute();
            });

            // Event for continue button
            document.getElementById(DOM.contBtnId).addEventListener('click', () => {
                state = STATES.GAME_START;
                if(gameCtrl.getBet() > gameCtrl.getCredits()) {
                    gameCtrl.increaseBetMulti();
                    UiController.setBetText(gameCtrl.getBet());
                }
                this.execute();
            });

            // Event for cash out button
            document.getElementById(DOM.endBtnId).addEventListener('click', () => {
               state = STATES.INIT;
               this.execute();
            });
        };

/*
        // TODO: DEBUGGING PURPOSES ONLY!
        this.testing = () => {
            console.log(gameCtrl.getDeck());
            console.log(gameCtrl.getHandCards());
            console.log(gameCtrl.getCredits());
        };
*/
    }

    init() {
        this.setupListeners();
        this.execute();
    }
}

controller = new Controller(new GameController());
controller.init();