import store from '../../../../../../../src/vuex/store'
import Vue from 'vue'
import { mockedComponent, mockedDirective } from '../../../../helper'
import Promise from 'bluebird'

let CreateInjector = require('!!vue?inject!../../../../../../../src/components/Data/Documents/Common/CreateOrUpdate')
let Create

describe('createOrUpdate document tests', () => {
  let sandbox
  let vm
  let dispatchSpy
  let broadcastSpy
  let refreshIndexSpy
  let routerSpy
  let unsetNewDocumentSpy
  let setNewDocumentSpy
  let setPartialSpy
  let mergeDeepSpy
  let formatTypeSpy
  let triggerError = true
  let addAttributeFromPathSpy
  let getUpdatedSchemaSpy
  let countAttributesStub

  let mockInjector = () => {
    Create = CreateInjector({
      '../../Collections/Tabs': mockedComponent,
      '../../../../services/kuzzle': {
        dataCollectionFactory: () => {
          return {
            getMappingPromise: () => {
              if (triggerError) {
                return Promise.reject(new Error('error'))
              }
              return Promise.resolve({mapping: {foo: 'bar'}})
            }
          }
        },
        refreshIndex: refreshIndexSpy
      },
      '../../../Common/JsonForm/JsonForm': mockedComponent,
      '../../../../vuex/modules/data/actions': {
        unsetNewDocument: unsetNewDocumentSpy,
        setNewDocument: setNewDocumentSpy,
        setPartial: setPartialSpy
      },
      '../../../../vuex/modules/data/getters': {
        newDocument: sandbox.stub().returns(42)
      },
      'vue': {
        set: sandbox.stub()
      },
      '../../../Common/JsonEditor': mockedComponent,
      '../../../Materialize/Modal': mockedComponent,
      '../../../../directives/Materialize/m-select.directive': mockedDirective('m-select'),
      '../../../../services/documentFormat': {
        getRefMappingFromPath: addAttributeFromPathSpy,
        getUpdatedSchema: getUpdatedSchemaSpy
      },
      '../../../../services/objectHelper': {
        mergeDeep: mergeDeepSpy,
        formatType: formatTypeSpy,
        countAttributes: countAttributesStub
      },
      'bluebird': cb => cb(sinon.stub(), sinon.stub()),
      '../../../../directives/focus.directive': mockedDirective('focus')
    })

    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><create v-ref:create index="index" collection="collection"></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount('body')

    vm.$refs.create.$dispatch = dispatchSpy
    vm.$refs.create.$broadcast = broadcastSpy
    vm.$refs.create.$route = {params: {collection: 'coll', index: 'index'}}
    vm.$refs.create.$router = routerSpy
    vm.$refs.create.$refs.jsoneditor = {getJson: sandbox.stub().returns({foo: 'bar'})}
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    dispatchSpy = sandbox.stub()
    broadcastSpy = sandbox.stub()
    refreshIndexSpy = sandbox.stub()
    routerSpy = {go: sandbox.stub(), _children: {$remove: sandbox.stub(), push: sandbox.stub()}}
    unsetNewDocumentSpy = sandbox.stub()
    setNewDocumentSpy = sandbox.stub()
    setPartialSpy = sandbox.stub()
    mergeDeepSpy = sandbox.stub()
    formatTypeSpy = sandbox.stub()
    addAttributeFromPathSpy = sandbox.stub().returns({})
    getUpdatedSchemaSpy = sandbox.stub().returns({properties: {}})
    countAttributesStub = sandbox.stub()

    mockInjector()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods tests', () => {
    describe('create method test', () => {
      it('should get the json content and dispatch a create event', () => {
        vm.$refs.create.viewState = 'code'
        vm.$refs.create.create()
        expect(dispatchSpy.calledWith('document-create::create', 'code', {foo: 'bar'})).to.be.ok
      })
    })

    describe('switchEditMode', () => {
      it('should merge mapping from the jsonform', () => {
        vm.$refs.create.viewState = 'code'
        vm.$refs.create.switchEditMode()
        expect(mergeDeepSpy.called).to.be.ok
      })

      it('should switch the viewState without merging', () => {
        vm.$refs.create.viewState = 'form'
        vm.$refs.create.switchEditMode()
        expect(mergeDeepSpy.called).to.be.not.ok
      })
    })

    describe('addRootAttr', () => {
      it('should open a modal', () => {
        vm.$refs.create.addRootAttr()
        expect(broadcastSpy.called).to.be.ok
      })
    })

    describe('doAddAttr', () => {
      it('should add a nested attribute and close the modal', () => {
        vm.$refs.create.newAttributeType = 'nested'
        vm.$refs.create.doAddAttr()
        expect(broadcastSpy.calledWith('modal-close', 'add-attr')).to.be.ok
      })

      it('should add attribute and close the modal', () => {
        vm.$refs.create.newAttributeType = 'boolean'
        vm.$refs.create.doAddAttr()
        expect(broadcastSpy.calledWith('modal-close', 'add-attr')).to.be.ok
      })
    })

    describe('dismissError', () => {
      it('should dispatch reset error event', () => {
        vm.$refs.create.dismissError()

        expect(dispatchSpy.calledWith('document-create::reset-error')).to.be.equal(true)
      })
    })

    describe('show', () => {
      it('should set some variables', () => {
        vm.$refs.create.show()

        expect(vm.$refs.create.showAnyway).to.equals(true)
        expect(vm.$refs.create.big).to.equals(false)
      })
    })
  })

  describe('beforeDestroy test', () => {
    it('should unset the document before destroying the component', () => {
      vm.$destroy()
      expect(unsetNewDocumentSpy.called).to.be.ok
    })
  })

  describe('ready', () => {
    it('should get the mapping of the current collection', (done) => {
      triggerError = false
      mockInjector()
      setTimeout(() => {
        expect(formatTypeSpy.calledWith({foo: 'bar'})).to.be.ok
        done()
      }, 0)
    })
  })

  describe('document too big', () => {
    it('should set a flag to true if the document has over 100 attributes', (done) => {
      triggerError = false
      countAttributesStub = sandbox.stub().returns(101)
      mockInjector()
      setTimeout(() => {
        expect(vm.$refs.create.big).to.equals(true)
        done()
      }, 0)
    })
  })
})
