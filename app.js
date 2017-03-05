var Hand = require('pokersolver').Hand;

var hand = Hand.solve(['Ad', 'As', 'Jc', 'Th', '2d', 'Qs', 'Qd']);
console.log(hand.name); // Two Pair
console.log(hand.descr); // Two Pair, A's & Q's

