'use strict';

//import config from '../../config/index.js';
import { expect } from 'chai';
import sinon from 'sinon';
// eslint-disable-next-line no-unused-vars
import { UserRepo, UserRepoSingleton } from './user-repo.js';
import { SequelizeSingleton } from './foundation/sequalize.js';
// eslint-disable-next-line no-unused-vars
import { Sequelize } from 'sequelize';






describe('UserRepo Test suites', function () {


  /**
   * @type {UserRepo}
  */
  let mUserRepo;


  beforeEach( async function() {

    mUserRepo = await UserRepoSingleton.geUserRepoInstance();
    await mUserRepo.sync();
  });


  afterEach( async function() {

    sinon.restore();
    if( !mUserRepo ) this.skip();

    /**
     * @type {Sequelize}
    */
    const sequalize = await SequelizeSingleton.getInstance();
    await sequalize.drop();

  })


  describe('#UserRepo user registration', function() {

    it( 'should create a new user with the specified name', async function() {

      const name = 'Bob';
      const userModel = await mUserRepo.registerUser( name);
      expect(userModel.name).to.equal(name);
      expect(userModel.id).eqls(1);
    });


    it( 'should create another new user with the specified name', async function() {

      const name = 'Jane';
      const userModel = await mUserRepo.registerUser( name);
      expect(userModel.name).to.equal(name);
      expect(userModel.id).eqls(1); // Unit tests should be independent!
    });


  });


  describe('#UserRepo user retrieval', function() {

    it( 'should return the last user out of two', async function() {

      const name = 'Bob';
      await mUserRepo.registerUser( name);

      const foundUser = await mUserRepo.getByID(1);
      expect(foundUser).to.not.null;
      expect(foundUser.name).eqls( name);

    })

  });

});