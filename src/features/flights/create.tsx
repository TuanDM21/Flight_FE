import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TimePicker } from '@/components/time-picker'
import { useAirports } from '../airports/hooks/use-airports'
import { flightStatusLabels } from './constants'
import { useCreateFlight } from './hooks/use-create-flight'
import { createFlightFormSchema } from './schema'
import type { CreateFlightFormData } from './types'

export function CreateFlightPage() {
  const createFlight = useCreateFlight()
  const navigate = useNavigate()
  const { data, isLoading: airportsLoading } = useAirports()
  const airports = data?.data || []

  // Helper function to convert time string to Date object for TimePicker
  const timeStringToDate = (timeString: string | undefined) => {
    if (!timeString) return undefined
    const today = new Date()
    const [hours, minutes, seconds] = timeString.split(':').map(Number)
    const date = new Date(today)
    date.setHours(hours, minutes, seconds || 0, 0)
    return date
  }

  const form = useForm<CreateFlightFormData>({
    resolver: zodResolver(createFlightFormSchema),
    defaultValues: {
      flightNumber: '',
      departureAirportId: undefined,
      arrivalAirportId: undefined,
      flightDate: undefined,
      departureTime: '',
      arrivalTime: '',
      arrivalTimeatArrival: '',
      status: '',
      airline: '',
      checkInCounters: '',
      gate: undefined,
      note: '',
    },
  })

  // Watch selected airports to filter options
  const selectedDepartureAirport = form.watch('departureAirportId')
  const selectedArrivalAirport = form.watch('arrivalAirportId')

  // Filter airports to prevent selecting the same airport for departure and arrival
  const availableDepartureAirports = airports?.filter(
    (airport) => airport.id !== selectedArrivalAirport
  )
  const availableArrivalAirports = airports?.filter(
    (airport) => airport.id !== selectedDepartureAirport
  )

  const onSubmit = (formData: CreateFlightFormData) => {
    // Transform form data to API payload format
    const payload = {
      flightNumber: formData.flightNumber,
      departureAirportId: formData.departureAirportId,
      arrivalAirportId: formData.arrivalAirportId,
      flightDate: formData.flightDate
        ? format(formData.flightDate, 'yyyy-MM-dd')
        : '',
      departureTime: formData.departureTime,
      arrivalTime: formData.arrivalTime,
      airline: formData.airline,
      status: formData.status,
      gate: formData.gate,
      checkInCounters: formData.checkInCounters,
      note: formData.note,
      arrivalTimeatArrival: formData.arrivalTimeatArrival,
    }
    const promise = createFlight.mutateAsync({
      body: payload,
    })
    toast.promise(promise, {
      loading: 'Đang tạo chuyến bay...',
      success: () => {
        form.reset()
        navigate({ to: '/flights' })
        return 'Chuyến bay đã được tạo thành công!'
      },
      error: 'Đã xảy ra lỗi khi tạo chuyến bay. Vui lòng thử lại sau.',
    })
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <div className='container mx-auto flex-1'>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chuyến bay</CardTitle>
            <CardDescription>
              Vui lòng điền đầy đủ thông tin bên dưới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
                id='flight-form'
              >
                {/* Flight Number, Airline and Gate */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='flightNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số hiệu chuyến bay</FormLabel>
                        <FormControl>
                          <Input placeholder='VN123' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='airline'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hãng bay</FormLabel>
                        <FormControl>
                          <Input placeholder='Vietnam Airlines' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='gate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cổng khởi hành</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number.parseInt(value))
                          }}
                          value={
                            field.value ? field.value.toString() : undefined
                          }
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Chọn cổng' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='1'>Cổng 1</SelectItem>
                            <SelectItem value='2'>Cổng 2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Airport Selectors */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='departureAirportId'
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Sân bay đi</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number.parseInt(value))
                          }}
                          value={
                            field.value ? field.value.toString() : undefined
                          }
                          disabled={airportsLoading}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn(
                                'w-full',
                                fieldState.error && 'border-destructive'
                              )}
                            >
                              <SelectValue
                                placeholder={
                                  airportsLoading
                                    ? 'Đang tải...'
                                    : 'Chọn sân bay khởi hành'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDepartureAirports?.map((airport) => (
                              <SelectItem
                                key={airport.id}
                                value={airport.id?.toString() || ''}
                              >
                                {airport.airportCode} - {airport.airportName} (
                                {airport.city})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='arrivalAirportId'
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Sân bay đến</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number.parseInt(value))
                          }}
                          value={
                            field.value ? field.value.toString() : undefined
                          }
                          disabled={airportsLoading}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn(
                                'w-full',
                                fieldState.error && 'border-destructive'
                              )}
                            >
                              <SelectValue placeholder='Chọn sân bay đến' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableArrivalAirports?.map((airport) => (
                              <SelectItem
                                key={airport.id}
                                value={airport.id?.toString() || ''}
                              >
                                {airport.airportCode} - {airport.airportName} (
                                {airport.city})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date Field */}
                <div className='grid grid-cols-1 gap-6'>
                  {/* Flight Date */}
                  <FormField
                    control={form.control}
                    name='flightDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bay</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder='Chọn ngày bay'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Time Fields */}
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                  {/* Departure Time */}
                  <FormField
                    control={form.control}
                    name='departureTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ khởi hành</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={timeStringToDate(field.value)}
                            onChange={(date) => {
                              if (date) {
                                const timeString = format(date, 'HH:mm:ss')
                                field.onChange(timeString)
                              } else {
                                field.onChange('')
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Arrival Time */}
                  <FormField
                    control={form.control}
                    name='arrivalTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ đến</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={timeStringToDate(field.value)}
                            onChange={(date) => {
                              if (date) {
                                const timeString = format(date, 'HH:mm:ss')
                                field.onChange(timeString)
                              } else {
                                field.onChange('')
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Arrival Time at Arrival (optional) */}
                  <FormField
                    control={form.control}
                    name='arrivalTimeatArrival'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ đến thực tế (tùy chọn)</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={timeStringToDate(field.value)}
                            onChange={(date) => {
                              if (date) {
                                const timeString = format(date, 'HH:mm:ss')
                                field.onChange(timeString)
                              } else {
                                field.onChange('')
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Optional Fields */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái (tùy chọn)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Chọn trạng thái' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(flightStatusLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Check-in Counters */}
                  <FormField
                    control={form.control}
                    name='checkInCounters'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quầy check-in (tùy chọn)</FormLabel>
                        <FormControl>
                          <Input placeholder='A1-A5, B1-B3' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Note Field */}
                <FormField
                  control={form.control}
                  name='note'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Nhập ghi chú cho chuyến bay (tùy chọn)...'
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Submit Buttons */}
      <div className='bg-background sticky bottom-0 mt-auto border-t p-4'>
        <div className='container mx-auto'>
          <div className='flex justify-end gap-4'>
            <Button
              type='submit'
              form='flight-form'
              disabled={createFlight.isPending}
            >
              {createFlight.isPending ? 'Đang tạo...' : 'Tạo chuyến bay'}
            </Button>
            <Link to='/flights'>
              <Button type='button' variant='outline'>
                Hủy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
