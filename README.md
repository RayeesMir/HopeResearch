# HopeResearch
Hope Research Code Challange

# San Francisco Movies Search

### Live Demo 
   http://139.59.20.72:3000/ (May Not Be Available After Sometime)
   
### What is this repository for? ###

* This Project Lets You Search Movies that had been filmed in San Francisco and draws Markers on the location with autocomplete feature.(there may not be marker for some of movies as i didn't got geolocation from google's geoCode API; because of ambigious location names in data source.May be in future it can be resolved)
* Version 1.0   

### Requirements ###

 * Node
 * MongoDB
 * Elastic Search (optional elastic code is commented)
 
### How do I get set up? ###

* Clone Repo.
* Run "npm install" 
* Run "npm rum import" (To import Data from the Datasource Provided and save that in database)
* Run "npm start" and you are ready to go server will start on port 3000


      
### EndPoints
  *   /events/:repo/:event
      * GET Method
      * Paramsyou need to Pass RepositoryId and eventType in params.This endpoint Return records filtered by the repository id and event type 
  *   /repo/all
      This endpoint Return list of all repositories with their top contributor (actor with most events).
  *   /actor/:login
      you need to Pass login as parameter. Return actor details and list of contributed repositories by actor login
  *   /repo/highest/:login
  *   /events/:login
   


### Who do I talk to? ###

* mail me on mirrayees859@gmail.com
* feel free to raise issue
