'use client'

import * as React from 'react'
import { DialogsContext } from '@/context/dialogs-context'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog as AlertDialogPrimitive,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useEventCallback from './use-event-callback'
import { useNonNullableContext } from './use-non-nullable-context'

export interface OpenDialogOptions<R> {
  /**
   * A function that is called before closing the dialog closes. The dialog
   * stays open as long as the returned promise is not resolved. Use this if
   * you want to perform an async action on close and show a loading state.
   *
   * @param result The result that the dialog will return after closing.
   * @returns A promise that resolves when the dialog can be closed.
   */
  onClose?: (result: R) => Promise<void>
}

export interface AlertOptions extends OpenDialogOptions<void> {
  /**
   * A title for the dialog. Defaults to `'Alert'`.
   */
  title?: React.ReactNode
  /**
   * The text to show in the "Ok" button. Defaults to `'Ok'`.
   */
  okText?: React.ReactNode
}

export interface ConfirmOptions extends OpenDialogOptions<boolean> {
  /**
   * A title for the dialog. Defaults to `'Confirm'`.
   */
  title?: React.ReactNode
  /**
   * The text to show in the "Ok" button. Defaults to `'Ok'`.
   */
  okText?: React.ReactNode
  /**
   * Denotes the purpose of the dialog. This will affect the color of the
   * "Ok" button. Defaults to `undefined`.
   */
  severity?: 'error' | 'info' | 'success' | 'warning'
  /**
   * The text to show in the "Cancel" button. Defaults to `'Cancel'`.
   */
  cancelText?: React.ReactNode
}

export interface PromptOptions extends OpenDialogOptions<string | null> {
  /**
   * A title for the dialog. Defaults to `'Prompt'`.
   */
  title?: React.ReactNode
  /**
   * The text to show in the "Ok" button. Defaults to `'Ok'`.
   */
  okText?: React.ReactNode
  /**
   * The text to show in the "Cancel" button. Defaults to `'Cancel'`.
   */
  cancelText?: React.ReactNode
}

/**
 * The props that are passed to a dialog component.
 */
export interface DialogProps<P = undefined, R = void> {
  /**
   * The payload that was passed when the dialog was opened.
   */
  payload: P
  /**
   * Whether the dialog is open.
   */
  open: boolean
  /**
   * A function to call when the dialog should be closed. If the dialog has a return
   * value, it should be passed as an argument to this function. You should use the promise
   * that is returned to show a loading state while the dialog is performing async actions
   * on close.
   * @param result The result to return from the dialog.
   * @returns A promise that resolves when the dialog can be fully closed.
   */
  onClose: (result: R) => Promise<void>
}

export interface OpenAlertDialog {
  /**
   * Open an alert dialog. Returns a promise that resolves when the user
   * closes the dialog.
   *
   * @param msg The message to show in the dialog.
   * @param options Additional options for the dialog.
   * @returns A promise that resolves when the dialog is closed.
   */
  (msg: React.ReactNode, options?: AlertOptions): Promise<void>
}

export interface OpenConfirmDialog {
  /**
   * Open a confirmation dialog. Returns a promise that resolves to true if
   * the user confirms, false if the user cancels.
   *
   * @param msg The message to show in the dialog.
   * @param options Additional options for the dialog.
   * @returns A promise that resolves to true if the user confirms, false if the user cancels.
   */
  (msg: React.ReactNode, options?: ConfirmOptions): Promise<boolean>
}

export interface OpenPromptDialog {
  /**
   * Open a prompt dialog to request user input. Returns a promise that resolves to the input
   * if the user confirms, null if the user cancels.
   *
   * @param msg The message to show in the dialog.
   * @param options Additional options for the dialog.
   * @returns A promise that resolves to the user input if the user confirms, null if the user cancels.
   */
  (msg: React.ReactNode, options?: PromptOptions): Promise<string | null>
}

export type DialogComponent<P, R> = React.ComponentType<DialogProps<P, R>>

export interface OpenDialog {
  /**
   * Open a dialog without payload.
   * @param Component The dialog component to open.
   * @param options Additional options for the dialog.
   */
  <P extends undefined, R>(
    Component: DialogComponent<P, R>,
    payload?: P,
    options?: OpenDialogOptions<R>
  ): Promise<R>
  /**
   * Open a dialog and pass a payload.
   * @param Component The dialog component to open.
   * @param payload The payload to pass to the dialog.
   * @param options Additional options for the dialog.
   */
  <P, R>(
    Component: DialogComponent<P, R>,
    payload: P,
    options?: OpenDialogOptions<R>
  ): Promise<R>
}

export interface CloseDialog {
  /**
   * Close a dialog and return a result.
   * @param dialog The dialog to close. The promise returned by `open`.
   * @param result The result to return from the dialog.
   * @returns A promise that resolves when the dialog is fully closed.
   */
  <R>(dialog: Promise<R>, result: R): Promise<R>
}

export interface OpenSheet {
  /**
   * Open a sheet without payload.
   * @param Component The sheet component to open.
   * @param options Additional options for the sheet.
   */
  <P extends undefined, R>(
    Component: DialogComponent<P, R>,
    payload?: P,
    options?: OpenDialogOptions<R>
  ): Promise<R>
  /**
   * Open a sheet and pass a payload.
   * @param Component The sheet component to open.
   * @param payload The payload to pass to the sheet.
   * @param options Additional options for the sheet.
   */
  <P, R>(
    Component: DialogComponent<P, R>,
    payload: P,
    options?: OpenDialogOptions<R>
  ): Promise<R>
}

export interface DialogHook {
  alert: OpenAlertDialog
  confirm: OpenConfirmDialog
  prompt: OpenPromptDialog
  open: OpenDialog
  close: CloseDialog
  sheet: OpenSheet
  closeAll: () => void
}

function useDialogLoadingButton(onClose: () => Promise<void>) {
  const [loading, setLoading] = React.useState(false)
  const handleClick = async () => {
    try {
      setLoading(true)
      await onClose()
    } finally {
      setLoading(false)
    }
  }
  return {
    onClick: handleClick,
    loading,
  }
}

export interface AlertDialogPayload extends AlertOptions {
  msg: React.ReactNode
}

export interface AlertDialogProps extends DialogProps<AlertDialogPayload> {}

export function AlertDialog({ open, payload, onClose }: AlertDialogProps) {
  const localeText = {
    alert: 'Cảnh báo',
    ok: 'Đồng ý',
  }
  const okButtonProps = useDialogLoadingButton(() => onClose())

  return (
    <AlertDialogPrimitive
      open={open}
      onOpenChange={(isOpen: boolean) => !isOpen && onClose()}
    >
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {payload.title ?? localeText.alert}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{payload.msg}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            disabled={!open || okButtonProps.loading}
            onClick={okButtonProps.onClick}
          >
            {payload.okText ?? localeText.ok}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  )
}

export interface ConfirmDialogPayload extends ConfirmOptions {
  msg: React.ReactNode
}

export interface ConfirmDialogProps
  extends DialogProps<ConfirmDialogPayload, boolean> {}

export function ConfirmDialog({ open, payload, onClose }: ConfirmDialogProps) {
  const localeText = {
    confirm: 'Xác nhận',
    cancel: 'Hủy',
    ok: 'Xóa',
  }
  payload.severity ??= 'error'

  const cancelButtonProps = useDialogLoadingButton(() => onClose(false))
  const okButtonProps = useDialogLoadingButton(() => onClose(true))

  return (
    <AlertDialogPrimitive
      open={open}
      onOpenChange={(isOpen: boolean) => !isOpen && onClose(false)}
    >
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {payload.title ?? localeText.confirm}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{payload.msg}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={!open || cancelButtonProps.loading}
            onClick={cancelButtonProps.onClick}
          >
            {payload.cancelText ?? localeText.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!open || okButtonProps.loading}
            onClick={okButtonProps.onClick}
            className={
              payload.severity === 'error'
                ? 'bg-destructive hover:bg-destructive/90'
                : ''
            }
          >
            {payload.okText ?? localeText.ok}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  )
}

export interface PromptDialogPayload extends PromptOptions {
  msg: React.ReactNode
}

export interface PromptDialogProps
  extends DialogProps<PromptDialogPayload, string | null> {}

export function PromptDialog({ open, payload, onClose }: PromptDialogProps) {
  const localeText = {
    confirm: 'Xác nhận',
    cancel: 'Hủy',
    ok: 'Đồng ý',
  }
  const [input, setInput] = React.useState('')
  const cancelButtonProps = useDialogLoadingButton(() => onClose(null))

  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setLoading(true)
      const formData = new FormData(event.currentTarget)
      const value = formData.get('input') ?? ''
      if (typeof value !== 'string') {
        throw new TypeError('Value must come from a text input')
      }
      await onClose(value)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => !isOpen && onClose(null)}
    >
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{payload.title ?? localeText.confirm}</DialogTitle>
            <DialogDescription>{payload.msg}</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='input' className='text-right'>
                Nhập liệu
              </Label>
              <Input
                id='input'
                name='input'
                value={input}
                onChange={(event) => {
                  setInput(event.target.value)
                }}
                className='col-span-3'
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={!open || cancelButtonProps.loading}
              onClick={cancelButtonProps.onClick}
            >
              {payload.cancelText ?? localeText.cancel}
            </Button>
            <Button type='submit' disabled={!open || loading}>
              {payload.okText ?? localeText.ok}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function useDialogs(): DialogHook {
  const { open, close, closeAll } = useNonNullableContext(DialogsContext)

  const alert = useEventCallback<OpenAlertDialog>(
    (msg, { onClose, ...options } = {}) =>
      open(AlertDialog, { ...options, msg }, { onClose })
  )

  const confirm = useEventCallback<OpenConfirmDialog>(
    (msg, { onClose, ...options } = {}) =>
      open(ConfirmDialog, { ...options, msg }, { onClose })
  )

  const prompt = useEventCallback<OpenPromptDialog>(
    (msg, { onClose, ...options } = {}) =>
      open(PromptDialog, { ...options, msg }, { onClose })
  )

  function sheet<P extends undefined, R>(
    Component: DialogComponent<P, R>,
    payload?: P,
    options?: OpenDialogOptions<R>
  ): Promise<R>
  function sheet<P, R>(
    Component: DialogComponent<P, R>,
    payload: P,
    options?: OpenDialogOptions<R>
  ): Promise<R>
  function sheet<P, R>(
    Component: DialogComponent<P, R>,
    payload?: P,
    options: OpenDialogOptions<R> = {}
  ): Promise<R> {
    const { onClose, ...restOptions } = options
    return open(Component, payload as P, { onClose, ...restOptions })
  }

  return React.useMemo(
    () => ({
      alert,
      confirm,
      prompt,
      open,
      close,
      sheet,
      closeAll,
    }),
    [alert, close, confirm, open, prompt, sheet, closeAll]
  )
}
