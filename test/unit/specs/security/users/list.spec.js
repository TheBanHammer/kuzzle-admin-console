import Vue from 'vue'
import { mockedComponent } from '../../helper'
import store from '../../../../../src/vuex/store'

let ListInjector = require('!!vue?inject!../../../../../src/components/Security/Users/List')
import Promise from 'bluebird'

describe('Users list', () => {
  let List
  let vm
  let sandbox = sinon.sandbox.create()
  let documents = sandbox.stub().returns([])
  let totalDocuments = sandbox.stub()
  let paginationFrom = sandbox.stub()
  let paginationSize = sandbox.stub()
  let searchTerm = sandbox.stub()
  let rawFilter = sandbox.stub()
  let basicFilter = sandbox.stub()
  let sorting = sandbox.stub()
  let basicFilterForm = sandbox.stub()
  let go = sandbox.stub()
  let $broadcast
  let formatFromQuickSearch = sandbox.stub()
  let formatFromBasicSearch = sandbox.stub()
  let formatSort = sandbox.stub()

  beforeEach(() => {
    List = ListInjector({
      '../../../vuex/modules/list/getters': {
        documents,
        totalDocuments,
        paginationFrom,
        paginationSize,
        searchTerm,
        rawFilter,
        basicFilter,
        sorting,
        basicFilterForm
      },
      '../../../services/filterFormat': {
        formatFromQuickSearch,
        formatFromBasicSearch,
        formatSort
      },
      '../../Common/Filters/Filters': mockedComponent,
      '../../Materialize/Modal': mockedComponent,
      '../../Materialize/Dropdown': mockedComponent,
      '../../Materialize/Pagination': mockedComponent,
      '../../Materialize/Headline': mockedComponent,
      './UserItem': mockedComponent
    })

    vm = new Vue({
      template: '<div><list v-ref:list></list></div>',
      components: {
        List
      },
      store: store
    }).$mount()

    vm.$refs.list.$router = {go}
    $broadcast = sandbox.stub(vm.$refs.list, '$broadcast')
  })

  afterEach(() => sandbox.restore())

  describe('Computed', () => {
    describe('displayBulkDelete', () => {
      it('should returns false if selectedDocuments is empty', (done) => {
        vm.$refs.list.selectedDocuments = []

        Vue.nextTick(() => {
          expect(vm.$refs.list.displayBulkDelete).to.be.equal(false)
          done()
        })
      })

      it('should returns true if selectedDocuments is not empty', (done) => {
        vm.$refs.list.selectedDocuments = ['doc1']

        Vue.nextTick(() => {
          expect(vm.$refs.list.displayBulkDelete).to.be.equal(true)
          done()
        })
      })
    })

    describe('allChecked', () => {
      beforeEach(() => {
        List = ListInjector({
          '../../../vuex/modules/list/getters': {
            documents: sandbox.stub().returns([{id: 'doc1'}, {id: 'doc2'}]),
            totalDocuments,
            paginationFrom,
            paginationSize,
            searchTerm,
            rawFilter,
            basicFilter,
            sorting,
            basicFilterForm
          },
          '../../../services/filterFormat': {
            formatFromQuickSearch,
            formatFromBasicSearch,
            formatSort
          },
          '../../Common/Filters/Filters': mockedComponent,
          '../../Materialize/Modal': mockedComponent,
          '../../Materialize/Dropdown': mockedComponent,
          '../../Materialize/Pagination': mockedComponent,
          '../../Materialize/Headline': mockedComponent,
          './UserItem': mockedComponent
        })

        vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()
      })

      it('should return false if there is not the same documents number in list and in selectedDocuments', () => {
        vm.$refs.list.selectedDocuments = ['doc1']
        expect(vm.$refs.list.allChecked).to.be.equal(false)
      })

      it('should return true if there is the same documents number in list and in selectedDocuments', () => {
        vm.$refs.list.selectedDocuments = ['doc1', 'doc2']
        expect(vm.$refs.list.allChecked).to.be.equal(true)
      })
    })
  })

  describe('Method', () => {
    describe('isChecked', () => {
      it('should return true only if the document is selected', () => {
        vm.$refs.list.selectedDocuments = ['doc1']
        expect(vm.$refs.list.isChecked('doc1')).to.be.equal(true)

        vm.$refs.list.selectedDocuments = ['doc2']
        expect(vm.$refs.list.isChecked('doc1')).to.be.equal(false)
      })
    })

    describe('toggleAll', () => {
      it('should empty selected documents if all documents are already selected', () => {
        List = ListInjector({
          '../../../vuex/modules/list/getters': {
            documents: sandbox.stub().returns([{id: 'doc1'}, {id: 'doc2'}]),
            totalDocuments,
            paginationFrom,
            paginationSize,
            searchTerm,
            rawFilter,
            basicFilter,
            sorting,
            basicFilterForm
          },
          '../../../services/filterFormat': {
            formatFromQuickSearch,
            formatFromBasicSearch,
            formatSort
          },
          '../../Common/Filters/Filters': mockedComponent,
          '../../Materialize/Modal': mockedComponent,
          '../../Materialize/Dropdown': mockedComponent,
          '../../Materialize/Pagination': mockedComponent,
          '../../Materialize/Headline': mockedComponent,
          './UserItem': mockedComponent
        })

        vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.selectedDocuments = ['doc1', 'doc2']
        vm.$refs.list.toggleAll()

        expect(vm.$refs.list.selectedDocuments).to.be.deep.equal([])
      })

      it('should add all documents in selected documents', () => {
        List = ListInjector({
          '../../../vuex/modules/list/getters': {
            documents: sandbox.stub().returns([{id: 'doc1'}, {id: 'doc2'}, {id: 'doc3'}]),
            totalDocuments,
            paginationFrom,
            paginationSize,
            searchTerm,
            rawFilter,
            basicFilter,
            sorting,
            basicFilterForm
          },
          '../../../services/filterFormat': {
            formatFromQuickSearch,
            formatFromBasicSearch,
            formatSort
          },
          '../../Common/Filters/Filters': mockedComponent,
          '../../Materialize/Modal': mockedComponent,
          '../../Materialize/Dropdown': mockedComponent,
          '../../Materialize/Pagination': mockedComponent,
          '../../Materialize/Headline': mockedComponent,
          './UserItem': mockedComponent
        })

        vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.selectedDocuments = ['doc1']
        vm.$refs.list.toggleAll()

        expect(vm.$refs.list.selectedDocuments).to.be.deep.equal(['doc1', 'doc2', 'doc3'])
      })
    })

    describe('toggleSelectDocuments', () => {
      it('should add the document in list', () => {
        vm.$refs.list.selectedDocuments = ['doc1']
        vm.$refs.list.toggleSelectDocuments('doc2')
        expect(vm.$refs.list.selectedDocuments).to.be.deep.equal(['doc1', 'doc2'])

        vm.$refs.list.toggleSelectDocuments('doc1')
        expect(vm.$refs.list.selectedDocuments).to.be.deep.equal(['doc2'])
      })

      it('should remove document from list if it\'s already there', () => {
        vm.$refs.list.selectedDocuments = ['doc1', 'doc2']
        vm.$refs.list.toggleSelectDocuments('doc1')

        expect(vm.$refs.list.selectedDocuments).to.be.deep.equal(['doc2'])
      })
    })

    describe('changePage', () => {
      it('should call the router with correct query parameter', () => {
        vm.$refs.list.$route = {query: {rawSearch: {toto: 'tutu'}}}

        vm.$refs.list.changePage(0)
        expect(go.calledWith({query: {rawSearch: {toto: 'tutu'}, from: 0}})).to.be.equal(true)

        vm.$refs.list.$route = {query: {rawSearch: {toto: 'tata'}}}
        vm.$refs.list.changePage(10)
        expect(go.calledWith({query: {rawSearch: {toto: 'tata'}, from: 10}})).to.be.equal(true)
      })
    })

    describe('confirmBulkDelete', () => {
      it('should dispatch event for close the corresponding modal', () => {
        sandbox.stub(vm.$refs.list, 'deleteUsers').returns(Promise.resolve())
        sandbox.stub(vm.$refs.list, 'refreshSearch')

        vm.$refs.list.confirmBulkDelete()

        expect($broadcast.calledWith('modal-close', 'bulk-delete')).to.be.equal(true)
      })

      it('should call delete users with the right list and refresh the users list', (done) => {
        vm.$refs.list.selectedDocuments = ['doc1', 'doc2']
        let deleteUsers = sandbox.stub(vm.$refs.list, 'deleteUsers').returns(Promise.resolve())
        let refreshSearch = sandbox.stub(vm.$refs.list, 'refreshSearch')

        vm.$refs.list.confirmBulkDelete()

        setTimeout(() => {
          expect(deleteUsers.calledWith(['doc1', 'doc2'])).to.be.equal(true)
          expect(refreshSearch.called).to.be.equal(true)
          done()
        }, 0)
      })

      it('should do nothing if delete was not a success', (done) => {
        sandbox.stub(vm.$refs.list, 'deleteUsers').returns(Promise.reject(new Error()))
        let refreshSearch = sandbox.stub(vm.$refs.list, 'refreshSearch')

        vm.$refs.list.confirmBulkDelete()

        setTimeout(() => {
          expect(refreshSearch.called).to.be.equal(false)
          done()
        }, 0)
      })
    })

    describe('quickSearch', () => {
      it('quick search must go on the route with a param search term', () => {
        vm.$refs.list.quickSearch('toto')
        expect(go.calledWith({query: {searchTerm: 'toto', from: 0}})).to.be.equal(true)

        vm.$refs.list.quickSearch('tutu')
        expect(go.calledWith({query: {searchTerm: 'tutu', from: 0}})).to.be.equal(true)
      })
    })

    describe('basicSearch', () => {
      it('should redirect on empty query if there is no filters and no sorting', () => {
        vm.$refs.list.basicSearch(null, null)
        expect(go.calledWith({query: {basicFilter: null, sorting: null, from: 0}})).to.be.equal(true)
      })

      it('should call go with right filter and sorting stringified', () => {
        let filter = {toto: 'tutu'}
        let sorting = {attribute: 'tata', order: 'asc'}
        vm.$refs.list.basicSearch(filter, sorting)

        expect(go.calledWith({query: {basicFilter: JSON.stringify(filter), sorting: JSON.stringify(sorting), from: 0}})).to.be.equal(true)
      })
    })

    describe('rawSearch', () => {
      it('should redirect on empty query if there is no filters', () => {
        vm.$refs.list.rawSearch(null)
        expect(go.calledWith({query: {rawFilter: null, from: 0}})).to.be.equal(true)

        vm.$refs.list.rawSearch({})
        expect(go.calledWith({query: {rawFilter: null, from: 0}})).to.be.equal(true)
      })

      it('should call go with right filter and sorting stringified', () => {
        let filter = {toto: 'tutu'}
        vm.$refs.list.rawSearch(filter)

        expect(go.calledWith({query: {rawFilter: JSON.stringify(filter), from: 0}})).to.be.equal(true)
      })
    })

    describe('refreshSearch', () => {
      it('should use existing query and reset from parameter', () => {
        vm.$refs.list.$route = {query: {basicFilter: "{toto: 'tutu'}"}}
        vm.$refs.list.refreshSearch()
        expect(go.calledWith({query: {basicFilter: "{toto: 'tutu'}", from: 0}})).to.be.equal(true)

        vm.$refs.list.$route = {query: {basicFilter: "{toto: 'tata'}"}}
        vm.$refs.list.refreshSearch()
        expect(go.calledWith({query: {basicFilter: "{toto: 'tata'}", from: 0}})).to.be.equal(true)
      })
    })
  })

  describe('route data', () => {
    beforeEach(() => {
      formatFromQuickSearch = sandbox.stub().returns({quick: 'filter1'})
      formatFromBasicSearch = sandbox.stub().returns({basic: 'filter1'})
      formatSort = sandbox.stub().returns([{attribute: 'attribute1'}])

      List.route.searchTerm = null
      List.route.rawFilter = null
      List.route.basicFilter = null
      List.route.sorting = null
      List.route.paginationFrom = 0
      List.route.paginationSize = 10
      List.route.performSearch = sandbox.stub()
    })

    it('should call performSearch with only pagination if there is nothing in store', () => {
      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {}, {from: 0, size: 10}, [])).to.be.equal(true)

      List.route.paginationFrom = 10
      List.route.paginationSize = 100

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {}, {from: 10, size: 100}, [])).to.be.equal(true)
    })

    it('should call performSearch with searchTerm if is set in store', () => {
      List.route.searchTerm = true

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {quick: 'filter1'}, {from: 0, size: 10}, [])).to.be.equal(true)
    })

    it('should call performSearch with basicFilter if is set in store', () => {
      List.route.basicFilter = true

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {basic: 'filter1'}, {from: 0, size: 10}, [])).to.be.equal(true)
    })

    it('should call performSearch with rawFilter and sort if is set in store', () => {
      List.route.rawFilter = {raw: 'filter1'}

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {raw: 'filter1'}, {from: 0, size: 10}, [])).to.be.equal(true)

      List.route.rawFilter = {raw: 'filter2', sort: [{attribute: 'attribute'}]}

      List.route.data()
      expect(List.route.performSearch.calledWith('users',
        '%kuzzle',
        {raw: 'filter2', sort: [{attribute: 'attribute'}]},
        {from: 0, size: 10},
        [{attribute: 'attribute'}])
      ).to.be.equal(true)
    })

    it('should call performSearch with sorting if is set in store', () => {
      List.route.sorting = true

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {}, {from: 0, size: 10}, [{attribute: 'attribute1'}])).to.be.equal(true)
    })
  })
})
