/* ==============================
 * ModelWrapper: Wrapper for models to add shared / universal behavior
 *      GUID: overrides default id attribute to use GUID strings instead of 
 *
 *
 * ============================== */

const { generateGuid, sequelizeCycleGuid, generateSlug } = require('./guid');


// returns a function
const ModelWrapper = function(name, schema, options = {}, fn){

  // this function will be exported from the model module; used by sequelize to create the schema
  return function(sequelize, DataTypes) {

    // baseSchema: describes 
    const baseSchema = {
      id: {
        type: DataTypes.STRING,
        // allowNull: false,
        primaryKey: true,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
      }
    }

    const baseOptions = {
      timestamps: true,
      paranoid: CONFIG.database.paranoid,
    }
    // the specified options overwrite the base schema, which contains universal field behaviors
    let combinedSchema = Object.assign({}, baseSchema, schema(DataTypes))

    let combinedOptions = Object.assign({}, baseOptions, options)

    for(let key in combinedSchema) if(!combinedSchema[key]) delete combinedSchema[key]

    const Model = sequelize.define(name, combinedSchema, combinedOptions)

    /* ==============================
     * Universal Hooks:
     *  1. ensures that before instances are created, that a random, unique GUID is generated
     *  2. generate
     * ============================== */

    // add any universal hooks, instance methods or static methods here

    Model.hook('beforeCreate', sequelizeCycleGuid)

    if(combinedSchema.slug) {
      let slugGenerationMethod = generateSlug({model: Model})
      Model.hook('beforeCreate', slugGenerationMethod)
      Model.hook('beforeUpdate', slugGenerationMethod)
      Model.hook('beforeSave', slugGenerationMethod)
    }

    // blank association method
    Model.associate = function(){
    
    }

    // execute the provided handler with the model as the argument
    // ensure that the handler also returns the model
    return fn && fn(Model)
  }
}

module.exports = {
  ModelWrapper,
  sequelizeCycleGuid
}
