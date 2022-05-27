import {GameSmartRepository} from './game-smart-repository'
import {ObjectId} from 'mongodb'
import {GamePairModel, QuestionModel} from './db'
import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {settings} from '../settings'

jest.setTimeout(200000)

describe("GameSmartRepository", () => {

    describe("findNotClosedPairForUser", () => {

        let user1Id = new ObjectId()
        let user2Id = new ObjectId()
        let user3Id = new ObjectId()
        let user4Id = new ObjectId()
        const repo = new GameSmartRepository()

        let mongoServer: MongoMemoryServer;

        beforeAll(async () => {
            mongoServer = await MongoMemoryServer.create()
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

        afterAll(async ()=>{
            await mongoose.connection.db.dropDatabase();
            await mongoose.disconnect()
            await mongoServer.stop()
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

    describe("registrate", () => {
        let user1Id = new ObjectId()
        let user2Id = new ObjectId()
        let user3Id = new ObjectId()
        let user4Id = new ObjectId()
        let user5Id = new ObjectId()
        let user6Id = new ObjectId()
        const repo = new GameSmartRepository()

        let mongoServer: MongoMemoryServer;

        beforeAll(async () => {
            mongoServer = await MongoMemoryServer.create()
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
            await QuestionModel.insertMany([
                {
                    _id: new ObjectId(),
                    title: "1+1",
                    answer: "2"
            },
                {
                    _id: new ObjectId(),
                    title: "1+2",
                    answer: "3"
                },
                {
                    _id: new ObjectId(),
                    title: "5*5",
                    answer: "25"
                },
                {
                    _id: new ObjectId(),
                    title: "6*6",
                    answer: "36"
                },
                {
                    _id: new ObjectId(),
                    title: "7*7",
                    answer: "49"
                }
            ])
        })

        afterAll(async ()=>{
            await mongoose.connection.db.dropDatabase();
            await mongoose.disconnect()
            await mongoServer.stop()
        })

        it("should return active pair", async () => {
            const result = await repo.registrate(user1Id)
            const result2= await repo.registrate(user2Id)
            expect(result).toBe(null)
            expect(result2).toBe(null)

            const result3 = await repo.registrate(user3Id)
            expect(result3).toBe(null)

        })
        it("should return ready to start pair", async () => {
            const result = await repo.registrate(user4Id)
            expect(result!.playersCount).toBe(2)


            const pair = await GamePairModel.findOne({
                _id: result!.pairId
            })
            expect(pair!.questionsIds.length).toBe(3)
            expect(pair!.player2Id).toEqual(user4Id)
            expect(pair!.player1Id).toEqual(user3Id)
        })

        it("should return new pair", async () => {
            const result = await repo.registrate(user5Id)
            expect(result!.playersCount).toBe(1)

            const pair = await GamePairModel.findOne({
                _id: result!.pairId
            })

            expect(pair!.player2Id).toBeNull()
            expect(pair!.player1Id).toEqual(user5Id)


        })

        it("if no qestions should return error", async () => {
            repo.questionsCount = 6
            await expect(async () => {
                await repo.registrate(user6Id);
            }).rejects.toThrow();
        })


    })
})
