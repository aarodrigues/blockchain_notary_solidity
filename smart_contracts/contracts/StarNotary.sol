pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 { 

    struct Star { 
        string name;
        string starStory;
        string ra;
        string dec;
        string mag;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo; 
    mapping(uint256 => uint256) public starsForSale;
    mapping(bytes32 => bytes32) public uniqueness;

    event validation(string error);
    event mintedToken(uint minted);

    uint public minted;

    function createStar(string _name, string _starStory, string _ra, string _dec, string _mag, uint256 _tokenId)  public { 
        
        minted = 0;

        if(isEmpty(_ra) || isEmpty(_dec) || isEmpty(_mag)){
            emit validation("Star coordenates cannot be empty!");
            return;
        }

        if(!isValid(_ra,_dec,_mag)){
            emit validation("Is not allowed stars with equal coordenates!");
            return;
        }
        
        Star memory newStar = Star(_name, _starStory, _ra, _dec, _mag);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);

        minted = 1;

        emit mintedToken(minted);
    }

    function isEmpty(string memory str) private pure returns (bool empty){
        bytes memory emptyString = bytes(str); // Uses memory
        if (emptyString.length == 0) {
            empty = true;
        } else {
            empty = false;
        }
    }

    function isValid(string _ra, string _dec, string _mag) private returns (bool){
        bytes32  coordHash = keccak256(abi.encodePacked(_ra,_dec,_mag));

        if(uniqueness[coordHash] == coordHash){
            return false;
        }else{
            uniqueness[coordHash] = coordHash;
            return true;
        }
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }
}