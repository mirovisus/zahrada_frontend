import { forwardRef } from 'react'
import { CrossButton } from '../../shared/ui/cross-button'
import { Button } from '../../shared/ui/button'
import { Chip } from '../../shared/ui/chip'

const PROPOSAL_STATUS_LABELS = {
  NOVY: 'Nový',
  SCHVALEN: 'Schválen',
  ZAMITNUT: 'Zamítnut',
  UPRAVY_POZADOVANY: 'Úpravy požadovány',
}

export const ProposalsModal = forwardRef(function ProposalsModal(
  { demand, proposals = [], isLoading = false, error = '', onAccept, onReject },
  ref,
) {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close()
    }
  }

  const handleCloseClick = (event) => {
    event.currentTarget.closest('dialog')?.close()
  }

  return (
    <dialog className="offer-modal" ref={ref} onClick={handleBackdropClick}>
      <div className="offer-modal__header">
        <div className="offer-modal__spacer" />
        <CrossButton className="offer-modal__close" label="Zavřít" onClick={handleCloseClick} />
      </div>

      <h3 className="offer-modal__title h3">
        Návrhy na poptávku{demand?.gardenName ? `: ${demand.gardenName}` : ''}
      </h3>

      {isLoading && <p>Načítání…</p>}
      {!isLoading && error && <p className="field__error">{error}</p>}
      {!isLoading && !error && proposals.length === 0 && <p>Zatím žádné návrhy.</p>}

      {!isLoading && !error && proposals.length > 0 && (
        <ul>
          {proposals.map((proposal) => (
            <li key={proposal.id}>
              <div className="card">
                <div className="card__content">
                  <p>
                    <strong>
                      {proposal.workerFirstName} {proposal.workerLastName}
                    </strong>{' '}
                    <Chip variant="secondary">{PROPOSAL_STATUS_LABELS[proposal.status] ?? proposal.status}</Chip>
                  </p>

                  {proposal.workerBio && <p>{proposal.workerBio}</p>}

                  <p>{proposal.price} Kč</p>

                  {proposal.description && <p>{proposal.description}</p>}

                  {proposal.status === 'NOVY' && (
                    <div>
                      <Button variant="green" type="button" onClick={() => onAccept?.(proposal.id)}>
                        Přijmout
                      </Button>
                      <Button variant="delete" type="button" onClick={() => onReject?.(proposal.id)}>
                        Odmítnout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </dialog>
  )
})
