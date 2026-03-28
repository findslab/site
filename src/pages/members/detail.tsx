import { useParams } from 'react-router-dom'
import { MembersDetailTemplate } from '@/components/templates/members/detail'
import LayoutOrganisms from "@/components/organisms/layout";

export const MembersDetail = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <LayoutOrganisms>
      <MembersDetailTemplate memberId={id || ''} />
    </LayoutOrganisms>
  )
}

export default MembersDetail
