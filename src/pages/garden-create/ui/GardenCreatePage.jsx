import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GardenForm } from '../../../features/garden-form'
import { createGarden, uploadGardenPhoto } from '../../../shared/api/gardens'
import { useToast } from '../../../shared/ui/toast'

export function GardenCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [photoFile, setPhotoFile] = useState(null)

  const handleSubmit = async (values) => {
    const newGarden = await createGarden({
      gardenName: values.gardenName,
      areaSqm: Number(values.areaSqm),
      city: values.city,
      street: values.street,
      houseNumber: values.houseNumber,
      postalCode: values.postalCode,
    })

    if (photoFile) {
      try {
        await uploadGardenPhoto(newGarden.id, photoFile)
      } catch (error) {
        // zahrada už byla úspěšně vytvořena - selhání uploadu fotky nesmí zablokovat navigaci,
        // uživatel může fotku nahrát znovu z úpravy zahrady
        toast.error(error.message || 'Fotografii se nepodařilo nahrát, zkuste to znovu v úpravě zahrady')
      }
    }

    navigate('/profile')
  }

  return (
    <main className="content">
      <section className="section container">
        <GardenForm mode="create" onSubmit={handleSubmit} onPhotoChange={setPhotoFile} />
      </section>
    </main>
  )
}
