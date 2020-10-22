
export default abstract class Model {
    /**
     * get
     * @param {object} filter - a object with keys and values after what you want to filet, for example {id:32,name:"hugo"} then server will return all rows that fufill this
     */
    static getRowByFilter(filter: object) {
        // Will find a row dependent on the filter
    }
    /**
     * get
     */
    public getDependantRows() {

    }
    /** -- Okay I need to rename this  BELONGS TO, HAS MANY s
     * getSingle
     * @description - Returns the
     */
    public getDependingRows() {

    }
    /**
     * BelongsToMany
     */
    public BelongsToMany() {

    }


    /* I want syntax like 
    
    class Users extends Model{
        
        get messages(){
            this.hasMany(modelclass/"modelname",[myColymns("userClassColumns")],[])
        }

    }

    */

    // So for example we have something like this

    /* 
    
    User table
    

    MEssages table 

    Files Every file has one message but every message has many files
    */


}