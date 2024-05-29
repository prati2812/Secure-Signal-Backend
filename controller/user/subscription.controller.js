import { stripe } from "../../db/stripeConnection.js";
import {auth} from '../../db/connection.js';


export const paymentController = async(req,res) => {
   
  const {totalAmount} = req.body;  

  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2024-04-10'}
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(totalAmount * 100),
    currency: 'inr',
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: 'pk_test_51P7brgSDcdgSk3wP7hEakFuVVciPeOtf1Hsqs3i5HbL3jgSGxF8wTUYI2XVSJaRObtC1EbKtps9HDQLze6c9TQlJ00199XWpX4'
  });
         
}

export const paymentSuccessful = async(req,res) => {
  
  
  const {userId , selectedSubscription} = req.body;
  let date = new Date();
  
  if(!userId){
      return res.status(400).send('UserId not provided');
  }

  if(!selectedSubscription){
    return res.status(400).send("Subscription type is not provided");
  }

  if(selectedSubscription === 'Monthly'){
    date.setDate(date.getDate() + 30);
  }
  else if(selectedSubscription === 'Quarterly'){
    date.setDate(date.getDate() + 90);
  }
  else if(selectedSubscription === 'Yearly'){
    date.setFullYear(date.getFullYear()+1);
  }

  console.log(date); 
  let formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()} `;
  
  const database = auth.database();
  const userRef = database.ref(`users/${userId}/userProfile`);     

  await userRef.update({
     "isSubscribed":true,
     "subScriptionType":selectedSubscription,
     "subscriptionEndTime":formattedDate,
  });
  
   return res.status(200).send("saved successfully");
}


export const updateSubscriptionData = async(req,res) => {
  console.log("update Data");
  const {userId} = req.body;

  if(!userId){
    return res.status(400).send('UserId not provided');
  }

  const database = auth.database();
  const userRef = database.ref(`users/${userId}/userProfile`);     

  await userRef.update({
     "isSubscribed":false,
     "subScriptionType":'',
     "subscriptionEndTime":'',
  });


  return res.status(200).send("Data updated Successfully");

}
