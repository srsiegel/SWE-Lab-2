'use strict';
import mongoose from "mongoose";
import {connectToDatabase} from "../connectMongodb.js"
import {saveDataInDB, deleteDataInDB, count} from "../JSONtoMongo.js"
import * as fs from "fs";
import {findFootballClubBySchoolName, findFootballClubByTags, retrieveAllFootballClubs} from  "../queries.js"

let data
beforeAll(async () => {
  data = JSON.parse(fs.readFileSync("../schools.json"))
  await connectToDatabase()
  await deleteDataInDB()
  await saveDataInDB(data)
  
});

afterAll( async () => {
  await deleteDataInDB()
  await mongoose.disconnect()
});

// Turn each array into a string and see if there's an exact match.
const arrEqual = (arr1, arr2) => {
  return JSON.stringify(arr1) == JSON.stringify(arr2)
}

// Check each property of two objects
// Handles where one of the fields might be an array
const clubEqual = (obj1, obj2) => {
  var keys = Object.keys(obj1)
  for(var i = 0; i < keys.length; i++){
    if(Array.isArray(obj1[keys[i]])){
      if ( ! arrEqual( obj1[keys[i]], obj2[keys[i]] ) ){
        return false
      }
    } else if( obj1[keys[i]] != obj2[keys[i]] ){
      console.log(keys[i], 'is not equal')
      return false
    }
  }
  return true
}

test('test findOne', async () => {
  for(var i = 0; i < data.length; i++){
    await findFootballClubBySchoolName(data[i].school).then(async club => {
      if(club){
        const bool = clubEqual(data[i], club)
        await expect(bool).toBeTruthy()
      }
    }).catch(err =>{
      //console.log(err)
    })
    
  }
})

test('test tags', async () => {
  for(var i = 0; i < data.length; i++){
    const index = Math.floor(Math.random() * data[i].search.length);
    const tag = data[i].search[index]
    await findFootballClubByTags(tag).then(async club =>{
      if(club){
        const bool = clubEqual(data[i], club)
        await expect(bool).toBeTruthy()
      }
      
    }).catch(err => {
      //console.log(err)
    })
  }
})

test('test retrieveAll', async () => {
  const result = await retrieveAllFootballClubs()
  for(var i = 0; i < data.length; i++){
    let bool = clubEqual(data[i], result[i])
    await expect(bool).toBeTruthy()
  }
})