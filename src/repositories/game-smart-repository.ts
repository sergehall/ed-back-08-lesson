import {ObjectId} from 'mongodb'
import {GamePairModel} from './db'

export class GameSmartRepository {
    async findNotClosedPairForUser(userId: ObjectId): Promise<{ playersCount: number } | null> {
        const activePair = await GamePairModel.findOne({
            $or: [{player1Id: userId}, {player2Id: userId}],
            closed: false
        })

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

        const activePair = await GamePairModel.findOne({
            $or: [{player1Id: userId}, {player2Id: userId}],
            closed: false
        })

        if (activePair) {
            return null
        }

        const unfilledPair = await GamePairModel.findOne({
            player2Id: null,
            closed: false
        })

        if (unfilledPair) {

            unfilledPair.player2Id = userId

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



