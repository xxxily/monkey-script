import { clone } from './object'
export default class List {
  constructor () {
    this._list = []
  }

  create (msg) {
    return new List()
  }

  getList () {
    return clone(this._list)
  }

  has (item) {
    return this._list.includes(item)
  }

  add (item) {
    this._list = Array.from(new Set(this._list.push(item)))
  }

  del () {
    //
  }
}
