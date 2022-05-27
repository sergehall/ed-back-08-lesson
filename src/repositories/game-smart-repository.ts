import {ObjectId} from 'mongodb'
import {GamePairModel, QuestionModel} from './db'

export class GameSmartRepository {
    constructor(public questionsCount: number=3){}
    private async findNotClosedPair(userId: ObjectId) {
        const activePair = await GamePairModel.findOne({
            $or: [{player1Id: userId}, {player2Id: userId}],
            closed: false
        })
        return activePair
    }

    async findNotClosedPairForUser(userId: ObjectId): Promise<{ playersCount: number } | null> {
        const activePair = await this.findNotClosedPair(userId)

        let playersCount = 0

        if (activePair) {
            playersCount++
            if (activePair.player2Id) {
                playersCount++
            }
            return {playersCount: playersCount}
        }

        return null
    }
    async registrate(userId: ObjectId): Promise<{ playersCount: number, pairId: ObjectId } | null> {

        const activePair = await this.findNotClosedPair(userId)
            //user already registered and wait 2nd player
        if (activePair) {
            return null
        }

        const unfilledPair = await GamePairModel.findOne({
            player2Id: null,
            closed: false
        })

        if (unfilledPair) {
            unfilledPair.player2Id = userId
            const totalQuestions = await QuestionModel.count({})
            if(totalQuestions<this.questionsCount) throw new Error("No questions in DB")
            const randomSkip = Math.floor(Math.random() * totalQuestions-(this.questionsCount - 1))
            const questions = await QuestionModel.find({}).limit(this.questionsCount).skip(randomSkip)
            unfilledPair.questionsIds = questions.map(q=>q._id)
            await unfilledPair.save()
            return {playersCount: 2, pairId: unfilledPair._id}
        }

        const newPair = new GamePairModel({
            player1Id: userId,
            closed: false,
            player2Id: null,
            _id: new ObjectId(),
             player1Answers: [],
             player2Answers: [],
            questionsIds: []
        })

        await newPair.save()

        return {playersCount: 1, pairId: newPair._id}
    }
}



