import _ from 'lodash'
import { memo } from 'react'
import { setters, useAppStore } from 'src/app/store'
import { formatHeadingTitle, parseTaskDate } from 'src/services/util'
import Block from './Block'
import Button from './Button'
import Droppable from './Droppable'
import { TaskPriorities } from 'src/types/enums'

const Unscheduled = memo(_Unscheduled, () => true)
export default Unscheduled

function _Unscheduled() {
  const showCompleted = useAppStore((state) => state.settings.showCompleted)
  const showingPastDates = useAppStore((state) => state.showingPastDates)
  const tasks = useAppStore((state) =>
    _.filter(
      state.tasks,
      (task) =>
        (showCompleted ||
          (showingPastDates ? task.completed : !task.completed)) &&
        !task.parent &&
        !task.queryParent &&
        !parseTaskDate(task)
    )
  )
  const childWidth = useAppStore((state) =>
    (state.viewMode === 'week' || state.viewMode === 'hour') &&
    state.childWidth > 1
      ? state.childWidth
      : 1
  )

  const allHeadings = useAppStore((state) =>
    tasks.flatMap(
      (task) =>
        formatHeadingTitle(
          task.path,
          state.settings.groupBy,
          state.dailyNoteInfo,
          task.page
        )[0]
    )
  )

  const collapsed = useAppStore((state) =>
    allHeadings.map((heading) => state.collapsed[heading]).includes(false)
  )

  return (
    <div className={`h-0 grow flex flex-col`}>
      <div className='flex items-center space-x-1 group flex-none'>
        <Button
          className='w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
          onClick={() => setters.patchCollapsed(allHeadings, !collapsed)}
          src={collapsed ? 'chevron-right' : 'chevron-down'}
        />
        <Droppable id='unscheduled-timespan' data={{ scheduled: '' }}>
          <div className='font-menu'>{'Unscheduled'}</div>
        </Droppable>
      </div>
      <div
        className={`h-0 grow w-full mt-1 rounded-lg ${
          childWidth > 1
            ? `unscheduled child:h-full child:child:h-full ${
                [
                  '',
                  'child:child:child:child:w-full',
                  'child:child:child:child:w-1/2',
                  'child:child:child:child:w-1/3',
                  'child:child:child:child:w-1/4',
                ][childWidth]
              }`
            : 'overflow-x-hidden overflow-y-auto'
        }`}
        data-auto-scroll={childWidth > 1 ? 'x' : 'y'}
      >
        <Block
          startISO={undefined}
          blocks={[]}
          events={[]}
          type='unscheduled'
          dragContainer='unscheduled'
          tasks={tasks}
        />
      </div>
    </div>
  )
}
