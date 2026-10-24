// 收藏 / 随机换一个 单测（纯函数，不依赖 DOM）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isFavorite, parseFavorites, pickRandomId, toggleInList } from '../src/client/favorites.ts'

test('parseFavorites 清洗脏数据', () => {
  assert.deepEqual(parseFavorites(null), [])
  assert.deepEqual(parseFavorites(''), [])
  assert.deepEqual(parseFavorites('not json'), [])
  assert.deepEqual(parseFavorites('{"a":1}'), [])
  assert.deepEqual(parseFavorites('["a", 2, "", "a", "b"]'), ['a', 'b'])
})

test('toggleInList 增删且不改入参', () => {
  const base = ['a']
  assert.deepEqual(toggleInList(base, 'b'), ['a', 'b'])
  assert.deepEqual(toggleInList(base, 'a'), [])
  assert.deepEqual(base, ['a'])
  assert.equal(isFavorite(['a'], 'a'), true)
  assert.equal(isFavorite(['a'], 'b'), false)
})

test('pickRandomId 排除当前项；无可选返回 null', () => {
  assert.equal(pickRandomId([], null), null)
  assert.equal(pickRandomId(['only'], 'only'), null)
  assert.equal(pickRandomId(['a', 'b'], 'a', () => 0), 'b')
  // random 返回 1（边界）不得越界
  assert.equal(pickRandomId(['a', 'b'], null, () => 1), 'b')
  // 负值也不越界
  assert.equal(pickRandomId(['a', 'b'], null, () => -1), 'a')
})
