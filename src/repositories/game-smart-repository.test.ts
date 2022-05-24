import {GameSmartRepository} from './game-smart-repository'
import {ObjectId} from 'mongodb'
import {GamePairModel} from './db'
import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {settings} from '../settings'

describe("GameSmartRepository", () => {

    describe("findNotClosedPairForUser", () => {

        let user1Id = new ObjectId()
        let user2Id = new ObjectId()
        let user3Id = new ObjectId()
        let user4Id = new ObjectId()
        const repo = new GameSmartRepository()

        beforeAll(async () => {
            const mongoServer = await MongoMemoryServer.create()
            const uri = mongoServer.getUri()
            await mongoose.connect(uri);
            await GamePairModel.insertMany([
                {
                    _id: new ObjectId(),
                    closed: false,
                    questionsIds: [],
                    player1Answers: [],
                    player2Answers: [],
                    player1Id: user1Id,
                    player2Id: user2Id
                },
                {
                    _id: new ObjectId(),
                    closed: false,
                    questionsIds: [],
                    player1Answers: [],
                    player2Answers: [],
                    player1Id: user3Id,
                    player2Id: null
                },
                {
                    _id: new ObjectId(),
                    closed: true,
                    questionsIds: [],
                    player1Answers: [],
                    player2Answers: [],
                    player1Id: user3Id,
                    player2Id: user4Id
                }
            ])
        })


        it("should return null if user is not in pair", async () => {
            const result = await repo.findNotClosedPairForUser(user4Id)
            expect(result).toBe(null)
        })
        it("should return 1 if user waits partner", async () => {
            const result = await repo.findNotClosedPairForUser(user3Id)
            expect(result!.playersCount).toBe(1)
        })
        it("should return 2 if user is participaiting in quiz", async () => {
            let result = await repo.findNotClosedPairForUser(user1Id)
            expect(result!.playersCount).toBe(2)
            result = await repo.findNotClosedPairForUser(user2Id)
            expect(result!.playersCount).toBe(2)
        })
    })
})
