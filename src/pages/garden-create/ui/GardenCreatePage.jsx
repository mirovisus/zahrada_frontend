import { useNavigate } from 'react-router-dom'
import { GardenForm } from '../../../features/garden-form'
import { createGarden } from '../../../shared/api/gardens'

export function GardenCreatePage() {
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    await createGarden({
      gardenName: values.gardenName,
      areaSqm: Number(values.areaSqm),
      city: values.city,
      street: values.street,
      houseNumber: values.houseNumber,
      postalCode: values.postalCode,
    })
    navigate('/profile')
  }

  return (
    <main className="content">
      <section className="section container">
        <GardenForm mode="create" onSubmit={handleSubmit} />
      </section>
    </main>
  )
}
