const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    let user1 = accounts[1]
    let user2 = accounts[2]
    let randomMaliciousUser = accounts[3]

    let name = 'awesome star!'
    let starStory = "this star was bought for my wife's birthday"
    let ra = "1"
    let dec = "1"
    let mag = "1"
    let starId = 1

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })

    describe('can create a star', () => { 
        it('can create a star and get its name', async function () { 
            await this.contract.createStar(name, starStory, ra, dec, mag, starId, {from: accounts[0]})
            //console.log(await this.contract.tokenIdToStarInfo(1));
            let star = await this.contract.tokenIdToStarInfo(1);
            assert.equal(star[0],name);
        })
    })

    describe('star uniqueness', () => { 

        beforeEach(async function() { 
            this.contract = await StarNotary.new({from: accounts[0]})
            await this.contract.createStar(name, starStory, ra, dec, mag, starId, {from: accounts[0]})
        })

        it('only stars unique stars can be minted', async function() { 
            // first we mint our first star
            await this.contract.createStar(name, starStory, ra, dec, mag, starId, {from: accounts[0]})
            // then we try to mint the same star, and we expect an error
            assert.equal(await this.contract.minted(),0);
        })

        it('only stars unique stars can be minted even if their ID is different', async function() { 
            // first we mint our first star
            await this.contract.createStar(name, starStory, ra, dec, mag, 2, {from: accounts[0]})
            // then we try to mint the same star, and we expect an error
            assert.equal(await this.contract.minted(),0);
        })

        it('minting unique stars does not fail', async function() { 
            for(let i = 0; i < 10; i ++) { 
                let id = i
                let newRa = i.toString()
                let newDec = i.toString()
                let newMag = i.toString()

                await this.contract.createStar(name, starStory, newRa, newDec, newMag, id, {from: user1})

                let starInfo = await this.contract.tokenIdToStarInfo(id)
                assert.equal(starInfo[0], name)
            }
        })
    })

    describe('buying and selling stars', () => { 

        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () { 
            await this.contract.createStar(name, starStory, ra, dec, mag, starId, {from: user1})
        })

        it('user1 can put up their star for sale', async function () { 
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            let balance = web3.eth.getBalance(user2).valueOf()
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() { 
                var block = web3.eth.getBlock("latest");
                console.log("gasLimit: " + block.gasLimit);
                web3.eth.getGasPrice(function(e, r) { console.log("Cost: " + (block.gasLimit * r ))})

                await this.contract.buyStar(starId, {from: user2, value: 10 * starPrice})
                assert.equal(await this.contract.ownerOf(starId),user2)
            })

            it('user2 ether balance changed correctly', async function () { 
                
                console.log(balance.valueOf())
       
                //const gasCost = tx.gasPrice.mul(receipt.gasUsed);
                //onsole.log("Spend value: "+ web3.fromWei(gasCost))
                //await this.contract.buyStar(starId, {from: user2, value: 10 * starPrice})
                assert.equal(web3.eth.getBalance(user2).valueOf(),(balance.valueOf()-web3.eth.getBalance(user2).valueOf()))
            })
        })
    })
})

var expectThrow = async function(promise) { 
    try { 
        await promise
    } catch (error) { 
        assert.exists(error)
        return 
    }

    assert.fail('expected an error, but none was found')
}