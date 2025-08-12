import $queryClient from '@/api'

export interface AssignableUser {
  id: number
  name: string
  email: string
  roleName?: string
  teamName?: string
  unitName?: string
}

export function useAssignableUsers() {
  const query = $queryClient.useQuery('get', '/api/users/assignable')

  // Mock data for testing
  const mockUsers: AssignableUser[] = [
    {
      id: 1,
      name: 'DO MINH TUAN',
      email: 'domtuan21@gmail.com',
      roleName: 'admin',
      teamName: 'Đội Kỹ Thuật',
      unitName: 'Tổ Kỷ Thuật Nhà Ga',
    },
    {
      id: 2,
      name: 'NGUYEN VAN A',
      email: 'nguyenvana@gmail.com',
      roleName: 'member',
      teamName: 'Đội Kỹ Thuật',
      unitName: 'Tổ Kỷ Thuật Nhà Ga',
    },
    {
      id: 3,
      name: 'TRAN THI B',
      email: 'tranthib@gmail.com',
      roleName: 'member',
      teamName: 'Đội Vận Hành',
      unitName: 'Tổ Vận Hành',
    },
  ]

  return {
    ...query,
    data: query.data?.data ? (query.data.data as AssignableUser[]) : mockUsers,
  }
}
