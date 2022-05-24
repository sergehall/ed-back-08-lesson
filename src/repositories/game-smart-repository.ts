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
    async registrate(userId: ObjectId): Promise<{ playersCount: number }> {
        return {playersCount: 0}
    }
}



