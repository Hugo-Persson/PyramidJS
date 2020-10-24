
export default abstract class Model {
    /**
     * get
     * @param {object} filter - a object with keys and values after what you want to filet, for example {id:32,name:"hugo"} then server will return all rows that fufill this
     */
    static getRowByFilter(filter: object) {
        // Will find a row dependent on the filter
    }

    /**
     * belongsToMany
     */
    protected belongsToMany() {

    }

    /**
     * belongTo
     */
    protected belongTo() {

    }
    /**
     * hasMany
     */
    protected hasMany() {

    }
    /**
     * hasOne
     */
    protected hasOne(relatedModel): Model {
        return new relatedModel();
    }

    /* I want syntax like 
    
    class Users extends Model{
        
        get messages(){
            this.hasMany(modelclass/"modelname",primaryKey, forreignKey)
        }
        

    }

    */

}