import { Router } from 'express';
import { authentication } from '../../middleware/authentication.js';
import { addLiveLocations, addTravellingLocation, deleteAllFetchTravellingLocation, deleteTravellingLocation, fetchLiveLocationSharedByGuardians, fetchTravellingLocations, findNearestHospital, findNearestPoliceStation, findTravellingDistance, shareLiveLocationToNearestPoliceStation } from '../../controller/user/location.controller.js';


const locationRouter = Router();

locationRouter.post("/addTravelLocation" , authentication ,addTravellingLocation);
locationRouter.post("/fetchTravellingLocations" , authentication , fetchTravellingLocations);
locationRouter.post("/addLiveLocation" , authentication, addLiveLocations);
locationRouter.post("/nearestPoliceStation" , authentication ,findNearestPoliceStation);
locationRouter.post("/nearestHospital", authentication, findNearestHospital);
locationRouter.post("/shareLocationNearestPoliceStation" , authentication , shareLiveLocationToNearestPoliceStation);
locationRouter.post("/fetchLiveLocation" , authentication, fetchLiveLocationSharedByGuardians);
locationRouter.post("/deleteAllTravellingLocation" ,authentication, deleteAllFetchTravellingLocation);
locationRouter.post("/findTravellingDistance", authentication , findTravellingDistance);
locationRouter.post("/deleteTravellingLocation", authentication , deleteTravellingLocation);



export default locationRouter;