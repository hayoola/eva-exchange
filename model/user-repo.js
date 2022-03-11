'use strict';


import config from '../config/index.js';
import { nanoid } from 'nanoid/async';
// eslint-disable-next-line no-unused-vars
import { Sequelize, Model, DataTypes } from 'sequelize';
import { SequelizeSingleton } from './foundation/sequalize.js';




class UserRepo {

  /**
   * Static async builder, since we can't have an async constructor!
  */
  static async build() {

    let mUserRepo = null;

    try {

      const sequelizeInstance = await SequelizeSingleton.getInstance();
      mUserRepo = new UserRepo( sequelizeInstance);
      await mUserRepo.syncSchemaWithDatabase();

    } catch( inError ) {

      config.loggman.error(`UserRepo::build error: ${inError}`);
      mUserRepo = null;
    }

    return mUserRepo;

  }


  constructor( inSequelize ) {

    this.mSequelize = inSequelize;
    
    User.init({
      id: {
        type: DataTypes.CHAR(21),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize: this.mSequelize,
      modelName: 'User'
    });
  }


  async syncSchemaWithDatabase() {

    await User.sync();
  }


  async registerUser(inName) {

    const nid = await nanoid();
    const newUser = await User.create({ id: nid, name: inName});
    console.debug(newUser.toJSON());

    return newUser;
  }


  async getByID( inID ) {

    const foundUser = await User.findByPk( inID);
    return foundUser;
  }

}


class User extends Model {

}




const UserRepoSingleton = (function () {
  let mUserRepoInstance;

  /**
   * Create an instance of the UserRepo class
   * 
   * @returns {Promise} A Promise on a UserRepo instance
   */
  async function createInstance() {
    let theUserRepo = await UserRepo.build();
    return theUserRepo;
  }

  return {
    /**
     * Get the singleton instance
     * 
     * @returns {Promise} A Promise, which its value is the UserRepo instance
     */
    geUserRepoInstance: function () {
      if (!mUserRepoInstance) {
        mUserRepoInstance = createInstance();
      }
      return mUserRepoInstance;
    }
  };
})();


export {
  UserRepoSingleton,
  UserRepo,
  User
}