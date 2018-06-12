# Reddit-clone-APIs
This repository contains the REST API for creating, updating, down-voting and up-voting a Reddit like content sharing system.
The backend of the system is written in Node.js+Express

API's specifications/contracts are being hosted on Heroku and can be accessed 

https://limitless-peak-22038.herokuapp.com/api-docs/#/

Site is also hosted at https://limitless-peak-22038.herokuapp.com/v1/

You can use the Try it now button available to test the API. Most of the important API contracts are provided in the specifications but few are missing because of the limitation of the swagger in some ways.


### Swagger API Try me Now UI ###
![Try-Me-Now](/public/images/try-it-now.PNG?raw=true "Try-Me-Now")


### Swagger API Specification UI ###


![Swagger API Specifications](/public/images/swagger-ui.PNG?raw=true "Swagger API Specifications")


### Swagger API POST /posts call ###


![Post Call](/public/images/post-call.PNG?raw=true "Post Call")


### Swagger API /posts response ###


![Post Response](/public/images/post-response.PNG?raw=true "Post Response")

## How to test the APIs ##
- Any REST client like Postman,etc could be used to populate the data and visualize it on the browser. e.g. make a POST /posts call with some data and then head to the https://limitless-peak-22038.herokuapp.com/v1/posts to see if it returns the recently created data. similarly other calls could be made to and visualize it
- Try passing data in current format as defined by API specs to the URIs and see the result as expected or not
- Try passing data in wrong format and see if you get proper validation error or not. e.g. by not passing *content* in the body of POST /posts call, by sending invalid JSON structure to any URI,etc
- Try passing wrong type of data and see if server validates it or not. e.g. passing string value as upvote counter instead of number, passing number field as userid instead of string,etc
- Try going to wrong URI address and see if you get server error with message that the URI does not exist. e.g. *POST /nonexistent-url* and see what server responds
- Try passing unsupported http method like **DELETE,PATCH to /posts/:id** and check if server responds with correct error message or not


**API's endpoints:**

**POST /v1/posts**

  * create a new post | return status 201 -created | status 400 if required parameters are missing |500 for any server related error

  ```javascript
    post_payload_body = { content : "String of length 256 TEXT REQUIRED", authorID: "user id of the author STRING REQUIRED"
  ```

**GET /v1/posts**

  * return list of all posts in the memory
  
**PUT  /v1/posts/:id/up**

  -   upvote a post identified by :id | return status 200 on successful update| status 400 if required params are missing | status 404 if post id doesn't exist in the system| status 500 for internal server error
  ```javascript
    post_upvote_payload_body = { upvotes : "increment counter NUMBER REQUIRED", voterId: "user id of the voter STRING REQUIRED"
  ```

**POST /v1/posts/:id/down**

  - downvotes a post identified by :id | return status 200 on successful update| status 400 if required params are missing | status 404 if post id doesn't exist in the system| status 500 for internal server error
  
  ```javascript
    post_doenvote_payload_body = { downvotes : "decrement counter NUMBER REQUIRED", voterId: "user id of the voter STRING REQUIRED"
  ```
  
**GET  /v1/posts/popularity**
  - return top 20 posts ordered by total number of upvotes | status 200 on successful completion of request | status 500 for internal server errors
  
**GET  v1/posts/popularity/:limit?**
  - returns only a subset of top posts(limited by {limit}) ordered by highest number of upvotes | status 200 on successful completion of request |status 500 on server errors | If a negative number is passed as the limit, it returns default top 20 posts 
  
  ```javascript
    limit : NUMBER OPTIONAL
  ```
  
**GET /non-existent-url**
  - if the user tries to ask for some random URI which system doesn't support, a message will appear explaining the same | status 500 is returned along with the message
  
**DELETE /posts | PATCH /posts**
  - if the user tries to ask for some http method which our server dosen't support, server will notify it with status code 404 and message that it doesn't support DELETE
  
**OPTION /posts**
  - server will response with status code 200. This is required as some browser first make a call to server to check if POST/PUT is supported http methods or not.


# Design: #

- All the data that is sent from the server to the frontend is enveloped properly to remove potential security risks which comes with sending non-envelop data

- All the data passe to APIs are validated and encoded/escaped to remove any possibility of web attacks like passing scripts to the system as user data

- Although session and other user authentication related functionality is not asked, I have tried addressing them by simply creating mock function in order to better provide the idea of how the data will flow in the system.

- Status codes have been chosen with care when returning to the user

- API has been written with extensibility in mind reason being no API remains same for a long time. For the same reason I have given this API specification as version V1(/v1/posts)

- In memory data storage structure is inspired by MongoDB document-oriented design. so its extensible for future requirements without becoming the bottleneck

- I have given special attention to desgning the entire infrastructure because even though the requiremts were minimum, I have tried delivering a production ready and extensible backend system with security optimization and reducing the amount of web vulnerabilitties through my design by setting appropriate headers to **protect against cross site scripting,addressing unwanted header modifications, code security scan,addressing dependent package vulnerabilties,rate limiting to protect against spams, upvotes call going through a auth check for validating the validity of the user,using envelopes for data transmission,naming explicit media types,storing encoded data in the data storage and returning decoded data through API,etc to name a few**

**Note:** uglify package has a critical vulnerability but there are no patches out yet for it

- All the API functionality including routes are tested by writing unit and integration tests for them. I have done black box testing using superset and code flow BDD testing using mocha. I'll be adding more test as and when required. Currently, all the functionality is covered with their branching(cyclomatic complexities) if any

![Test Cases Passes](/public/images/test-run.PNG?raw=true "Test Cases")


- Support for HTTP method OPTIONS is provided because few browsers before making a post of POST/PUT call, checks the server for their supported methods. So it's possible that before a POST/PUT call is made a OPTIONS call will be made. And if we don't return status code 200 for OPTIONS then it won't fire the POST and PUT cal after getting the response from the server. So we have implicitly supported OPTIONS

- Provided support for method overriding in case some proxies which don't support PUT, PATCH, DELETE, etc out of the box

- Code for the APIs are well commented to help navigate the flow

### In-memory datatstructure designed for the storage of posts and user of the system: ###

```javascript
> posts = [{post_Json},{post_Json},{post_Json},{post_Json}]

post_Json = { "id": int autogenerated,
              "content": "string of 256 character",
              "authorId": "Id of user",
              "createTime": "datetime",
              "votes": int default 0,
              "voterIds": "array default []"
            }
users = [{user_json},{user_json},{user_json}]
user_Json = {
              "id": "int autogenerated",
              "username": "string unique"
            }
```

- We have only these two data structures for storage of posts and users in our system. Each one of them will hold a JSON object which will help us extend our data structure for storage with minimum efforts as our requirement starts to increases with time. This design is inspired by how MongoDB tries to denormalize the data as a document structure. Also storing the JSON object directly into our in-memory structure will not be a challenge. Also encoding and decoding of inputs become much easier with JSON format. This was another reason for choosing JSON object as the storage structure.

- Following the NoSQL paradigm, our each data structure will be basically responsible for storing anything related to them without any mapping maintained anywhere else. It will result in some duplications but the advantages overweight them in long run. 
For instance posts json object will be responsible for storing anythign related to a post like number of votes, who all upvoted it,who all commented on it, etc.

- **Field voter-Ids in post_Json** is a critical field in the design because of the given requirement that a single user can upvote a post any number of time. In such scenarios, we need to find a way to address spam. This field will help us in many ways when filtering the posts i.e if a post is popular but there are only a few people who have upvoted it, there is a likelihood that this could be because of spamming, popularity of a post can be determined by a factor of how many distinct users have liked it instead of bunch of people.

### Reason for not choosing HTTP-method PATCH for partial updates like updating votes for a post: ###
PATCH is not an idempotent call i.e storing a particular value against a key in database is idempotent because even if network fails or slows down and user clicked the button to post the same API many times, database will not go in inconsistent state but in case of incrementing a counter sending the patch request multiple times will have different effect on the database states. So even though we need to do a partial update of a single field **votes** in post_json by incrementing a counter, I have decided not to go with PATCH.

### Reason for not giving bulkified APIs: ###
Currently, APIs only support single insert at a time in terms of DB and that is a bad design since we can't do any optimization. Initially created a bulkified API for creating and updating but there are too many decision that is to be made and I wasn't sure should I do that for this or not. But I would love to discuss them whenever we could about my thought processes.

### Future scope : ###
- providing the option to pass filter to select which field to return in the response to an API call. It will significantly reduce the bandwidth usage for unnecessary data transmission which client sometimes doesn't require
- passing filter for on which key to sort the posts, currently, we support upvotes
- sending next page token in every result to support feasible pagination
