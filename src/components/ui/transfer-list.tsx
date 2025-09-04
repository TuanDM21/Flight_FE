'use client'

import React, { memo, useCallback, useEffect } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SquareCheckIcon,
  SquareIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type TransferListItemType = {
  key: string
  label: string
  selected?: boolean
}

type TransferListProps = {
  items: TransferListItemType[]
  targetKeys?: string[]
  onChange?(targetKeys: string[], direction: 'left' | 'right'): void
}

export const TransferList = memo(function ({
  items,
  onChange,
  targetKeys,
}: TransferListProps) {
  const [leftList, setLeftList] = React.useState<TransferListItemType[]>([])
  const [rightList, setRightList] = React.useState<TransferListItemType[]>([])
  const [leftSearch, setLeftSearch] = React.useState('')
  const [rightSearch, setRightSearch] = React.useState('')

  const moveToRight = useCallback(() => {
    const selectedItems = leftList.filter((item) => item.selected)
    const rightItems = [...rightList, ...selectedItems]
    setRightList(rightItems)
    setLeftList(leftList.filter((item) => !item.selected))
    onChange?.(
      rightItems.map((x) => x.key),
      'right'
    )
  }, [leftList, onChange, rightList])

  const moveToLeft = useCallback(() => {
    const selectedItems = rightList.filter((item) => item.selected)
    setLeftList((list) => [...list, ...selectedItems])
    const rightItems = rightList.filter((item) => !item.selected)
    setRightList(rightItems)
    onChange?.(
      rightItems.map((x) => x.key),
      'left'
    )
  }, [onChange, rightList])

  const toggleSelection = useCallback(
    (
      list: TransferListItemType[],
      setList: React.Dispatch<React.SetStateAction<TransferListItemType[]>>,
      key: string
    ) => {
      const updatedList = list.map((item) => {
        if (item.key === key) {
          return { ...item, selected: !item.selected }
        }
        return item
      })

      setList(updatedList)
    },
    []
  )

  useEffect(() => {
    const leftItems = items.filter((x) => !targetKeys?.some((y) => y === x.key))
    setLeftList(leftItems)
    const rightItems = items.filter((x) => targetKeys?.some((y) => y === x.key))
    setRightList(rightItems)
  }, [items, targetKeys])

  return (
    <div className='flex space-x-4'>
      <div className='bg-background w-1/2 rounded-sm shadow-sm'>
        <div className='flex items-center justify-between'>
          <Input
            placeholder='Tìm kiếm'
            className='rounded-tr-none rounded-br-none rounded-bl-none focus-visible:border-blue-500 focus-visible:ring-0'
            value={leftSearch}
            onChange={(e) => setLeftSearch(e.target.value)}
          />
          <Button
            className='rounded-tl-none rounded-br-none rounded-bl-none border-l-0'
            onClick={moveToRight}
            size='icon'
            variant='outline'
          >
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
        </div>
        <ul className='h-[200px] overflow-y-scroll rounded-br-sm rounded-bl-sm border-r border-b border-l p-1.5'>
          {leftList
            .filter((item) =>
              item.label.toLowerCase().includes(leftSearch.toLowerCase())
            )
            .map((item) => (
              <li
                className='hover:bg-muted flex items-center gap-1.5 rounded-sm text-sm'
                key={item.key}
              >
                <button
                  type={'button'}
                  className='flex w-full items-center gap-1.5 p-1.5'
                  onClick={() =>
                    toggleSelection(leftList, setLeftList, item.key)
                  }
                >
                  {item.selected ? (
                    <SquareCheckIcon className='text-muted-foreground/50 h-5 w-5' />
                  ) : (
                    <SquareIcon className='text-muted-foreground/50 h-5 w-5' />
                  )}
                  {item.label}
                </button>
              </li>
            ))}
        </ul>
      </div>

      <div className='bg-background w-1/2 rounded-sm shadow-sm'>
        <div className='flex items-center justify-between'>
          <Button
            className='rounded-tr-none rounded-br-none rounded-bl-none border-r-0'
            onClick={moveToLeft}
            size='icon'
            variant='outline'
          >
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Input
            placeholder='Tìm kiếm'
            className='rounded-tl-none rounded-br-none rounded-bl-none focus-visible:border-blue-500 focus-visible:ring-0'
            value={rightSearch}
            onChange={(e) => setRightSearch(e.target.value)}
          />
        </div>
        <ul className='h-[200px] overflow-y-scroll rounded-br-sm rounded-bl-sm border-r border-b border-l p-1.5'>
          {rightList
            .filter((item) =>
              item.label.toLowerCase().includes(rightSearch.toLowerCase())
            )
            .map((item) => (
              <li
                className='hover:bg-muted flex items-center gap-1.5 rounded-sm text-sm'
                key={item.key}
              >
                <button
                  type='button'
                  className='flex w-full items-center gap-1.5 p-1.5'
                  onClick={() =>
                    toggleSelection(rightList, setRightList, item.key)
                  }
                >
                  {item.selected ? (
                    <SquareCheckIcon className='text-muted-foreground/50 h-4 w-4' />
                  ) : (
                    <SquareIcon className='text-muted-foreground/50 h-4 w-4' />
                  )}
                  {item.label}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
})

TransferList.displayName = 'TransferList'
