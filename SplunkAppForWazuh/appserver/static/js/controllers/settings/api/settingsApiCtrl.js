define([
  '../../module',
], function (
  controllers
  ) {
    'use strict'
    
    class SettingsApi{
      constructor($scope, $currentDataService, apiList, $notificationService) {
        this.scope = $scope
        this.scope.addManagerContainer = false
        this.scope.isEditing = false
        this.scope.showForm = (apiList.length === 0) ? true : false
        this.scope.entry = {}
        this.scope.currentEntryKey = ''
        this.userRegEx = new RegExp(/^.{3,100}$/)
        this.passRegEx = new RegExp(/^.{3,100}$/)
        this.urlRegEx = new RegExp(/^https?:\/\/[a-zA-Z0-9-.]{1,300}$/)
        this.urlRegExIP = new RegExp(/^https?:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)
        this.portRegEx = new RegExp(/^[0-9]{2,5}$/)
        this.apiList = apiList
        this.currentDataService = $currentDataService
        this.toast = $notificationService.showSimpleToast
        this.savingApi = false
      }
      
      $onInit(){
        this.scope.init = () => this.init()
        this.scope.addNewApiClick = () => this.addNewApiClick()
        this.scope.checkManager = (entry) => this.checkManager(entry)
        this.scope.editEntry = (entry) => this.editEntry(entry)
        this.scope.removeManager = (entry) => this.removeManager(entry)
        this.scope.updateEntry = () => this.updateEntry()
        this.scope.selectManager = (mg) => this.selectManager(mg)
        this.scope.submitApiForm = () => this.submitApiForm()
        this.init()
        
      }
      
      async init () {
        try {
          // If no API, then remove cookie
          if (Array.isArray(this.apiList) && this.apiList.length === 0) {
            this.currentDataService.removeCurrentApi()
            this.scope.$emit('updatedAPI', () => { })
          }
          
          this.scope.apiList = this.apiList

          let currentApi = this.currentDataService.getApi()
          
          if (!currentApi && Array.isArray(this.scope.apiList)) {
            for (const apiEntry of this.scope.apiList) {
              try {
                await this.selectManager(apiEntry.id)
                // setAPI
                currentApi = this.currentDataService.getApi()
                break
              } catch (error) { }
            }
          }
          
          this.scope.apiList.map(item => { delete item.selected })
          
          if (currentApi) {
            this.scope.apiList.map(item => {
              if (item.id === currentApi.id) {
                item.selected = true
              }
            })
          }
        } catch (err) {
          this.toast('Error loading data')
        }
      }
      
      /**
      * Removes an API from the list
      * @param {Object} entry 
      */
      async removeManager (entry) {
        try {
          const currentApi = this.currentDataService.getApi()
          if (currentApi && currentApi.id === entry.id) {
            this.toast('Cannot delete selected API')
          } else {
            const index = this.scope.apiList.indexOf(entry)
            if (index > -1) {
              this.scope.apiList.splice(index, 1)
              await this.currentDataService.remove(entry)
            }
            this.toast('Manager was removed')
          }
        } catch (err) {
          this.toast('Cannot remove API:', err.message || err)
        }
      }
      
      /**
      * Check API connectivity
      * @param {Object} entry 
      */
      async checkManager(entry) {
        try {
          const connectionData = await this.currentDataService.checkApiConnection(entry.id)
          for (let i = 0; i < this.scope.apiList.length; i++) {
            if (this.scope.apiList[i].id === entry.id) {
              this.scope.apiList[i] = connectionData
              break
            }
          }
          this.toast('Established connection')
          if (!this.scope.$$phase) this.scope.$digest()
          
        } catch (err) {
          this.toast('Unreachable API')
        }
      }
      
      /**
      * Set form visible
      */
      addNewApiClick () {
        this.scope.showForm = !this.scope.showForm
        this.scope.edit = false
      }
      
      /**
      * Shows form for editting an API entry
      * @param {Object} entry 
      */
      editEntry(entry){
        try {
          this.scope.edit = !this.scope.edit
          this.scope.showForm = false
          this.scope.currentEntryKey = entry.id
          this.scope.url = entry.url
          this.scope.pass = entry.pass
          this.scope.port = entry.portapi
          this.scope.user = entry.userapi
          this.scope.managerName = entry.managerName
          this.scope.filterType = entry.filterType
          this.scope.filterName = entry.filterName
          this.scope.entry.url = entry
        } catch (err) {
          this.toast('Could not open API form')
        }
      }
      
      /**
      * Edits an entry
      * @param {Object} entry 
      */
      async updateEntry () {
        try {
          if(this.savingApi) {
            this.toast('Please, wait for success message')
            return
          }
          this.savingApi = true
          this.scope.edit = !this.scope.edit
          this.scope.showForm = false
          this.scope.entry.url = this.scope.url
          this.scope.entry.portapi = this.scope.port
          this.scope.entry.userapi = this.scope.user
          this.scope.entry.passapi = this.scope.pass
          this.scope.entry.filterType = this.scope.filterType
          this.scope.entry.filterName = this.scope.filterName
          this.scope.entry.managerName = this.scope.managerName
          this.scope.entry.id = this.scope.currentEntryKey
          
          delete this.scope.entry['$$hashKey']
          await this.currentDataService.checkRawConnection(this.scope.entry)
          await this.currentDataService.update(this.scope.entry)
          const updatedApi = await this.currentDataService.checkApiConnection(this.scope.entry.id)
                    
          for (let i = 0; i < this.scope.apiList.length; i++) {
            if (this.scope.apiList[i].id === updatedApi.id) {
              this.scope.apiList[i] = updatedApi
            }
          }
          if (!this.scope.$$phase) this.scope.$digest()
          
          if (this.currentDataService.getApi() && this.currentDataService.getApi().id === this.scope.entry.id) {
            this.selectManager(updatedApi.id)
          }
          
          this.scope.edit = false
          this.toast('Updated API')
        } catch (err) {
          this.toast('Cannot update API')
        }
        this.savingApi = false
      }
      
      
      /**
      * Select an API as the default one
      * @param {Object} entry 
      */
      async selectManager(entry){
        try {
          const connectionData = await this.currentDataService.checkApiConnection(entry)
          await this.currentDataService.chose(entry)
          this.scope.apiList.map(api => api.selected = false)
          for (let item of this.scope.apiList) {
            if (item.id === entry) {
              if (connectionData.cluster) {
                item.cluster = connectionData.cluster
              } else {
                item.cluster = 'Disabled'
              }
              item.managerName = connectionData.managerName
              item.selected = true
            }
          }
          this.toast('API selected')
          this.scope.$emit('updatedAPI', () => { })
          if (!this.scope.$$phase) this.scope.$digest()
        } catch (err) {
          this.toast('Could not select manager')
        }
      }
      
      /**
      * Adds a new API
      */
      async submitApiForm (){
        try {
          if(this.savingApi) {
            this.toast('Please, wait for success message')
            return
          }
          this.savingApi = true
          // When the Submit button is clicked, get all the form fields by accessing to the input values
          const form_url = this.scope.url
          const form_apiport = this.scope.port
          const form_apiuser = this.scope.user
          const form_apipass = this.scope.pass
          
          // If values are not valid then throw an error
          if (!this.validPassword(form_apipass) || !this.validPort(form_apiport) || !this.validUrl(form_url) || !this.validUsername(form_apiuser)){
            throw new Error('Invalid format. Please check the fields again')
          }
          
          // Create an object to store the field names and values
          const record = {
            "url": form_url,
            "portapi": form_apiport,
            "userapi": form_apiuser,
            "passapi": form_apipass,
          }
          
          // If connected to the API then continue
          await this.currentDataService.checkRawConnection(record)
          
          // Get the new API database ID
          const { result } = await this.currentDataService.insert(record)
          const id = result
          try {
            // Get the full API info
            const api = await this.currentDataService.checkApiConnection(id)
            // Empties the form fields
            this.clearForm()
            
            // If the only one API in the list, then try to select it
            this.scope.apiList.push(api)
            if (this.scope.apiList && this.scope.apiList.length === 1) {
              await this.selectManager(id)
            }
            this.scope.showForm = false
            if (!this.scope.$$phase) this.scope.$digest()
            this.toast('API was added')
            
          } catch (err) {
            this.currentDataService.remove(id).then(() => { }).catch((err) => { this.toast('Unexpected error') })
            this.toast('Unreachable API')
            this.savingApi = false
          }
          
        } catch (err) {
          this.toast(err.message)
          this.savingApi = false
        }
        this.savingApi = false
      }
      
      /**
      * Check if an URL is valid or not
      * @param {String} url 
      */
      validUrl (url) {
        return this.urlRegEx.test(url) || this.urlRegExIP.test(url)
      }
      
      /**
      * Check if a port is valid or not
      * @param {String} port 
      */
      validPort (port) {
        return this.portRegEx.test(port)
      }
      
      /**
      * Check if an user is valid or not
      * @param {String} user 
      */
      validUsername (user) {
        return this.userRegEx.test(user)
      }
      
      /**
      * Check if a password is valid or not
      * @param {String} pass 
      */
      validPassword (pass)  {
        return this.passRegEx.test(pass)
      }
      
      /**
      * Empties the form fields
      */
      clearForm ()  {
        this.scope.url = ''
        this.scope.port = ''
        this.scope.user = ''
        this.scope.pass = ''
      }
      
    }
    controllers.controller('settingsApiCtrl', SettingsApi)
  })
  
  