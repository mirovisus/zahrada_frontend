import { GardenForm } from '../../../features/garden-form'

export function GardenCreatePage() {
  const handleSubmit = (values) => {
    console.log(values)
  }

  return (
    <main className="content">
      <section className="section container">
        <GardenForm mode="create" onSubmit={handleSubmit} />
      </section>
    </main>
  )
}
