import {CopyIcon, LinkIcon, TrashIcon} from '@sanity/icons'
import {Box, Flex, Menu, MenuDivider, Stack} from '@sanity/ui'
import {useCallback} from 'react'
import {ContextMenuButton, LoadingBlock, type ObjectInputProps} from 'sanity'
import styled from 'styled-components'

import {CommentsProvider} from '../../../../../structure/comments'
import {MenuButton, MenuItem} from '../../../../../ui-components'
import {useTasksNavigation} from '../../context'
import {useRemoveTask} from '../../hooks/useRemoveTask'
import {type TaskDocument} from '../../types'
import {TasksActivityLog} from '../activity'
import {RemoveTaskDialog} from './RemoveTaskDialog'
import {StatusSelector} from './StatusSelector'
import {Title} from './TitleField'

const FirstRow = styled.div`
  display: flex;
  padding-bottom: 12px;
`

function FormActionsMenu({id, value}: {id: string; value: TaskDocument}) {
  const {setViewMode} = useTasksNavigation()
  const onTaskRemoved = useCallback(() => {
    setViewMode({type: 'list'})
  }, [setViewMode])
  const removeTask = useRemoveTask({id, onRemoved: onTaskRemoved})

  const duplicateTask = useCallback(() => {
    setViewMode({type: 'duplicate', duplicateTaskValues: value})
  }, [setViewMode, value])

  return (
    <>
      <Box paddingTop={3}>
        <MenuButton
          id="edit-task-menu"
          button={<ContextMenuButton />}
          menu={
            <Menu>
              <MenuItem text="Duplicate task" icon={CopyIcon} onClick={duplicateTask} />
              <MenuItem
                text="Copy link to task"
                icon={LinkIcon}
                disabled // TODO: This is not yet implemented
              />
              <MenuDivider />
              <MenuItem
                text="Delete task"
                icon={TrashIcon}
                onClick={removeTask.handleOpenDialog}
                tone="critical"
              />
            </Menu>
          }
        />
      </Box>
      <RemoveTaskDialog {...removeTask} />
    </>
  )
}

export function FormEdit(props: ObjectInputProps) {
  const statusField = props.schemaType.fields.find((f) => f.name === 'status')
  const value = props.value as TaskDocument

  if (!statusField) {
    throw new Error('Status field not found')
  }
  if (!props.value?._id) {
    return <LoadingBlock />
  }

  return (
    <>
      <Flex align="flex-start" gap={3}>
        <Box flex={1}>
          <Title
            onChange={props.onChange}
            value={props.value?.title}
            path={['title']}
            placeholder="Task title"
          />
        </Box>
        <FormActionsMenu id={props.value?._id} value={value} />
      </Flex>

      <FirstRow>
        <StatusSelector
          value={props.value?.status}
          path={['status']}
          onChange={props.onChange}
          options={statusField.type.options.list}
        />
      </FirstRow>

      {props.renderDefault(props)}

      <CommentsProvider documentType="tasks.task" documentId={value._id} scope="task">
        <Stack marginTop={5} marginBottom={4}>
          <TasksActivityLog value={value} />
        </Stack>
      </CommentsProvider>
    </>
  )
}
