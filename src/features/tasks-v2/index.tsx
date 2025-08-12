import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { List } from './components/list'

const tabs = [
  // {
  //   name: 'Board',
  //   value: 'board',
  //   component: <Board />,
  // },
  // {
  //   name: 'Calendar',
  //   value: 'calendar',
  //   component: <Calendar />,
  // },
  {
    name: 'List',
    value: 'list',
    component: <List />,
  },
]

export function TasksV2Page() {
  return (
    <Main fixed>
      <div className='flex h-full min-h-0 flex-1 flex-col'>
        <Tabs
          defaultValue='list'
          className='flex h-full min-h-0 w-full flex-1 flex-col'
        >
          <TabsList className='bg-background w-full max-w-xs justify-start rounded-none p-0'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='bg-background data-[state=active]:border-primary h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none'
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className='flex min-h-0 w-full flex-1 flex-col'
            >
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Main>
  )
}
