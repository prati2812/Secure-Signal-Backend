import {auth} from '../../db/connection.js';

const database = auth.database();

export const fetchLiveLocation = async(req,res) => {
    const {userId , senderId} = req.body;

    if(!userId){
        return res.status(400).send('UserId is not provided');
    }
    if(!senderId){
        return res.status(200).send('SenderId is not provided');
    }

    const userRef = database.ref(`police_station/${userId}/liveLocation/${senderId}/location`);

    await userRef.get().then((snapshot) => {
        const data = snapshot.val();
        return res.status(200).send(data);
    })

    

    

}