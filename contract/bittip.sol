// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


contract TipJar {
struct Tip {
address from;
uint256 amount;
string message;
uint256 timestamp;
}


// tips received by creator
mapping(address => Tip[]) private _tips;


// total tip amount per creator
mapping(address => uint256) public totalTips;


// events
event TipSent(address indexed creator, address indexed from, uint256 amount, string message);
event Withdrawn(address indexed creator, uint256 amount);


/// @notice Send a tip to a creator (payable)
/// @param creator The address of the creator to tip
/// @param message Optional tip message
function sendTip(address creator, string calldata message) external payable {
require(creator != address(0), "Invalid creator address");
require(msg.value > 0, "Tip must be > 0");


_tips[creator].push(Tip({
from: msg.sender,
amount: msg.value,
message: message,
timestamp: block.timestamp
}));


totalTips[creator] += msg.value;


emit TipSent(creator, msg.sender, msg.value, message);
}


/// @notice Get number of tips for a creator
/// @param creator Creator address
function getTipCount(address creator) external view returns (uint256) {
return _tips[creator].length;
}


/// @notice Get tip by index for a creator
/// @param creator Creator address
/// @param index Tip index
function getTip(address creator, uint256 index) external view returns (address from, uint256 amount, string memory message, uint256 timestamp) {
require(index < _tips[creator].length, "Index out of bounds");
Tip storage t = _tips[creator][index];
return (t.from, t.amount, t.message, t.timestamp);
}


/// @notice Get all tips for a creator (careful: could be expensive if many tips)
/// @dev For large arrays, prefer `getTipCount` + `getTip` batching
function getAllTips(address creator) external view returns (Tip[] memory) {
return _tips[creator];
}


/// @notice Withdraw all tips for the caller (creator)
function withdraw() external {
// compute withdrawable for msg.sender
uint256 amount = totalTips[msg.sender];
require(amount > 0, "No tips to withdraw");


// reset before transfer to prevent reentrancy risk
totalTips[msg.sender] = 0;


// clear tips array to save space (optional)
delete _tips[msg.sender];


(bool sent, ) = msg.sender.call{value: amount}("{}");
require(sent, "Failed to send Ether");


emit Withdrawn(msg.sender, amount);
}


/// @notice Fallback receive
receive() external payable {
revert("Use sendTip to tip a creator");
}
}