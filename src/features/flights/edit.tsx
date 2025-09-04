import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { EditFlightRoute } from '@/routes/_authenticated/flights/$flight-id/edit'
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
import { getFlightDetailQueryOptions } from './hooks/use-flight-detail'
import { useUpdateFlight } from './hooks/use-update-flight'
import { createFlightFormSchema } from './schema'
import type { CreateFlightFormData } from './types'

export default function EditFlightPage() {
  const flightId = EditFlightRoute.useParams()['flight-id']
  const navigate = useNavigate()

  const { data: flightDetailsQuery } = useSuspenseQuery(
    getFlightDetailQueryOptions(Number(flightId))
  )
  const updateFlightMutation = useUpdateFlight()
  const { data, isLoading: airportsLoading } = useAirports()

  const flightData = flightDetailsQuery?.data || {}
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

  // Helper function to safely get time string from API data
  const getTimeString = (timeData: any): string => {
    if (typeof timeData === 'string') {
      return timeData
    }
    if (
      timeData &&
      typeof timeData === 'object' &&
      timeData.hour !== undefined
    ) {
      const hours = timeData.hour.toString().padStart(2, '0')
      const minutes = (timeData.minute || 0).toString().padStart(2, '0')
      const seconds = (timeData.second || 0).toString().padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    }
    return ''
  }

  const form = useForm<CreateFlightFormData>({
    resolver: zodResolver(createFlightFormSchema),
    defaultValues: {
      flightNumber: flightData.flightNumber || '',
      departureAirportId: flightData.departureAirport?.id || undefined,
      arrivalAirportId: flightData.arrivalAirport?.id || undefined,
      flightDate: flightData.flightDate
        ? new Date(flightData.flightDate)
        : undefined,
      departureTime: getTimeString(flightData.departureTime),
      arrivalTime: getTimeString(flightData.arrivalTime),
      arrivalTimeatArrival: getTimeString(flightData.arrivalTimeatArrival),
      status: flightData.status || '',
      airline: flightData.airline || '',
      checkInCounters: flightData.checkInCounters || '',
      gate: flightData.gate || undefined,
      note: flightData.note || '',
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
    const payload = {
      flightNumber: formData.flightNumber,
      departureAirportId: formData.departureAirportId,
      arrivalAirportId: formData.arrivalAirportId,
      flightDate: formData.flightDate
        ? format(formData.flightDate, 'yyyy-MM-dd')
        : '',
      departureTime: formData.departureTime || '',
      arrivalTime: formData.arrivalTime || '',
      airline: formData.airline,
      status: formData.status,
      gate: formData.gate,
      checkInCounters: formData.checkInCounters,
      note: formData.note,
      arrivalTimeatArrival: formData.arrivalTimeatArrival || undefined,
    }

    const promise = updateFlightMutation.mutateAsync({
      body: payload,
      params: {
        path: { id: Number(flightId) },
      },
    })

    toast.promise(promise, {
      loading: 'Đang cập nhật chuyến bay...',
      success: () => {
        navigate({ to: '/flights' })
        return 'Cập nhật chuyến bay thành công!'
      },
      error: () => {
        return 'Cập nhật chuyến bay thất bại!'
      },
    })
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <div className='container mx-auto flex-1'>
        <Card>
          <CardHeader>
            <CardTitle>
              Chỉnh sửa chuyến bay #{flightData.flightNumber}
            </CardTitle>
            <CardDescription>Cập nhật thông tin chuyến bay</CardDescription>
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
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
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
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value ? field.value.toString() : ''}
                          disabled={airportsLoading}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn(
                                'w-full',
                                fieldState.error && 'border-destructive'
                              )}
                            >
                              <SelectValue placeholder='Chọn sân bay đi' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDepartureAirports?.map((airport) => (
                              <SelectItem
                                key={airport.id}
                                value={airport.id!.toString()}
                              >
                                {airport.airportCode} - {airport.airportName}
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
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value ? field.value.toString() : ''}
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
                                value={airport.id!.toString()}
                              >
                                {airport.airportCode} - {airport.airportName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date and Time Pickers */}
                <div className='space-y-6'>
                  {/* Flight Date */}
                  <FormField
                    control={form.control}
                    name='flightDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
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

                  {/* Time Fields */}
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <FormField
                      control={form.control}
                      name='departureTime'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>Giờ khởi hành</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={timeStringToDate(field.value)}
                              onChange={(date) => {
                                const timeString = date
                                  ? format(date, 'HH:mm:ss')
                                  : ''
                                field.onChange(timeString)
                              }}
                              placeholder='Chọn giờ khởi hành'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='arrivalTime'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>Giờ đến dự kiến</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={timeStringToDate(field.value)}
                              onChange={(date) => {
                                const timeString = date
                                  ? format(date, 'HH:mm:ss')
                                  : ''
                                field.onChange(timeString)
                              }}
                              placeholder='Chọn giờ đến'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='arrivalTimeatArrival'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>Giờ đến thực tế</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={timeStringToDate(field.value)}
                              onChange={(date) => {
                                const timeString = date
                                  ? format(date, 'HH:mm:ss')
                                  : ''
                                field.onChange(timeString)
                              }}
                              placeholder='Chọn giờ đến thực tế'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Status and Check-in */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
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
                  <FormField
                    control={form.control}
                    name='checkInCounters'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quầy check-in</FormLabel>
                        <FormControl>
                          <Input placeholder='A1-A5' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Note */}
                <FormField
                  control={form.control}
                  name='note'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Nhập ghi chú về chuyến bay...'
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
          <div className='bg-background sticky bottom-0 z-10 flex items-center justify-end space-x-2 border-t px-6 py-4'>
            <Button variant='outline' asChild>
              <Link to='/flights'>Hủy</Link>
            </Button>
            <Button
              form='flight-form'
              type='submit'
              disabled={updateFlightMutation.isPending}
              className='min-w-24'
            >
              {updateFlightMutation.isPending
                ? 'Đang lưu...'
                : 'Cập nhật chuyến bay'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
