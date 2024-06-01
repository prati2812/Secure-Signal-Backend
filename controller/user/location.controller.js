import { log } from 'firebase-functions/logger';
import {auth} from '../../db/connection.js';


export const addTravellingLocation = async (req,res) => {
    const database = auth.database();
    const {userId , travellingLocation , placeName} = req.body;
    if(!userId){
      return res.status(400).send('UserId not provided');  
    }
    if(!travellingLocation){
      return res.status(400).send('Location Not Provided');
    }
    if(!placeName){
      return res.status(400).send('Place Name is Required');
    }
  
  
  
    try{
  
      const userRef = database.ref(`users/${userId}/desiredLocation`);
      const key = userRef.push().key;
      userRef.child(key).set({
        "placeName" : placeName,
        "createdAt" : new Date().toJSON(),
        "location" : travellingLocation,
        "locationId":key,
      });
    
      res.status(200).send("Travelling Location  Saved Successfully"); 
    
    }
    catch(error){
       res.status(500).send("Internal Server Error");
    }
    
    
  
}
  
export const fetchTravellingLocations = async(req,res) => {
    
    const {userId} = req.body;
  
    if(!userId){
      return res.status(400).send('UserId not provided');  
    }
  
    let desiredLocation = [];
    const database = auth.database();
    const userRef = await database.ref(`users/${userId}/desiredLocation`);
     await userRef.get().then((snapshot) => {
       const data = snapshot.val();
       if(data){
          for(const id in data){
             const userLocation = data[id];
             desiredLocation.push(userLocation);
          }
       }
  
    })
  
    return res.status(200).send(desiredLocation);
  
}

export const addLiveLocations = async(req,res) => {
    const {userId , selectedUserId , location} = req.body;
    const database = auth.database();

    
    if(!userId){
      return res.status(400).send('UserId not provided');  
    }
    

    const userRef = database.ref(`users/${selectedUserId}/liveLocation/${userId}`);
      userRef.set({
         "location":location,
    })


    

    
    return res.status(200).send("Location Saved Successfully");

}

export const shareLiveLocationToNearestPoliceStation = async(req,res) => {
  const {userId , policeStationId , location} = req.body;
  const database = auth.database();

 
   
  if(!userId){
    return res.status(400).send('UserId not provided');  
  }
  

  const policeRef = database.ref(`police_station/${policeStationId}/liveLocation/${userId}`);
    policeRef.set({
       "location":location,
  });


  console.log("saved");
  return res.status(200).send("Location Saved Successfully");
}

export const findNearestPoliceStation = async(req,res) => {
   
    const {userId , currentLatitude , currentLongitude} = req.body;
   
    if(!userId){
       return res.status(400).send("User Id is not provided");
    }

   

    const database = auth.database();
    const registeredPoliceStation = []; 

    const userRef = database.ref(`police_station`);
    await userRef.get().then((snapshot) => {
         const data = snapshot.val();
         if(data){
             for(const id in data){
                 if(userId !== id){
                     const policeData = data[id];
                     const policeStationProfile = policeData.policeStationProfile;
                     const policeStationLocation = policeStationProfile.policeStationLocation;
                     registeredPoliceStation.push({policeStationLocation , id , policeStationProfile}); 
                 }
             }
         }
    });


  

   
    let nearestPoliceStation = registeredPoliceStation
        .map(station => {
            const latitude = station.policeStationLocation.latitude;
            const longitude = station.policeStationLocation.longtitude;
            const distance = getDistance(Number(currentLatitude), Number(currentLongitude), latitude, longitude);
            
            return { ...station, distance };
        })

     nearestPoliceStation = nearestPoliceStation.filter(station => {
      return  station.distance <= 13320;
     });

     
    return res.status(200).send({nearestPoliceStation});


}

export const findNearestHospital = async(req,res) => {
   
  const {userId , currentLatitude , currentLongitude} = req.body;
 
  if(!userId){
     return res.status(400).send("User Id is not provided");
  }

 
  const database = auth.database();
  const registeredHospital = []; 

  const userRef = database.ref(`hospital`);
  await userRef.get().then((snapshot) => {
       const data = snapshot.val();
       if(data){
           for(const id in data){
               if(userId !== id){
                   const hospitalData = data[id];
                   const hospitalProfile = hospitalData.hospitalProfile;
                   const hospitalLocation = hospitalProfile.hospitalLocation;
                   registeredHospital.push({hospitalLocation , id , hospitalProfile}); 
               }
           }
       }
  });


  

  
  let nearestHospital = registeredHospital.map(station => {
    const latitude = station.hospitalLocation.latitude;
    const longitude = station.hospitalLocation.longtitude;
    const distance = getDistance(Number(currentLatitude), Number(currentLongitude), latitude, longitude);
    console.log(currentLatitude , currentLongitude);
    console.log(distance);      
    return { ...station, distance };
  })

  nearestHospital = nearestHospital.filter(station => {
    return station.distance <= 13320;
  });



     
  return res.status(200).send({nearestHospital});

}


export const fetchLiveLocationSharedByGuardians = async(req,res) => {
  const { userId, senderId } = req.body;

  if (!userId) {
    return res.status(400).send('UserId is not provided');
  }
  if (!senderId) {
    return res.status(200).send('SenderId is not provided');
  }

  const database = auth.database();
  const userRef = database.ref(`users/${userId}/liveLocation/${senderId}/location`);

  await userRef.get().then((snapshot) => {
    const data = snapshot.val();
    return res.status(200).send(data);
  })

}

export const deleteAllFetchTravellingLocation = async(req,res) => {
    const {userId} = req.body;
    if(!userId){
      return res.status(400).send('UserId is not provided');
    }

    const database = auth.database();
    const userRef = database.ref(`users/${userId}/desiredLocation`);

    await userRef.remove().then(() => {
      return res.status(200).send("Delete All Location Successfully");
    }).catch((error) => {
      return res.status(500).send(error); 
    })

}

export const findTravellingDistance = async(req,res) => {
    const {currentLocation, travellingLocation} = req.body;
    if(!currentLocation){
      return res.status(400).send('currentLocation is not provided');
    }
    if(!travellingLocation){
      return res.status(400).send('travellingLocation is not provided');
    }

    console.log(currentLocation);
    console.log(travellingLocation);
    const targetLatitude = travellingLocation.location.latitude;
    const targetLongitude = travellingLocation.location.longtitude;

    
    const currentLatitude = currentLocation.latitude;
    const currentLongtitude = currentLocation.longitude;

    const distance = getDistance(currentLatitude , currentLongtitude, targetLatitude , targetLongitude);

    console.log(distance);
    return res.status(200).send({distance});



}



export const deleteTravellingLocation = async(req,res) => {
  const {userId , locationId} = req.body;
  if(!userId){
    return res.status(400).send('UserId is not provided');
  }
  if(!locationId){
    return res.status(400).send('LocationId is not provided');
  }

  const database = auth.database();
  const userRef = database.ref(`users/${userId}/desiredLocation/${locationId}`);

  await userRef.remove().then(() => {
    return res.status(200).send("Delete Location Successfully");
  }).catch((error) => {
    return res.status(500).send(error); 
  });

}

function getDistance(currentLatitude , currentLongtitude, latitude , longtitude){
  

  const R = 6371; 
  const dLat = deg2rad(latitude - currentLatitude);
  const dLon = deg2rad(longtitude - currentLongtitude);
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(currentLatitude)) * Math.cos(deg2rad(latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; 
  return distance; 

}


function deg2rad(deg){
  return deg * (Math.PI / 180);
}