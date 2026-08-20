import { forwardRef, useEffect, useState } from 'react'
import { CrossButton } from '../../shared/ui/cross-button'
import { Button } from '../../shared/ui/button'
import { Chip } from '../../shared/ui/chip'
import { Field } from '../../shared/ui/field'
import { normalizeFieldErrors } from '../../shared/api/client'
import { proposalStatusLabels, proposalStatusChipKeys } from '../../entities/proposal'
import { RatingStars } from './RatingStars'
import { AcceptWorkForm } from './AcceptWorkForm'

const COMMENT_MAX_LENGTH = 1000

export const ProposalsModal = forwardRef(function ProposalsModal(
  {
    demand,
    proposals = [],
    isLoading = false,
    error = '',
    onAccept,
    onReject,
    onRequestChanges,
    onAcceptWork,
    acceptWorkError = '',
    acceptWorkFieldErrors = {},
  },
  ref,
) {
  const [openCommentFor, setOpenCommentFor] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [commentErrors, setCommentErrors] = useState({})
  const [submittingId, setSubmittingId] = useState(null)
  const [showRejected, setShowRejected] = useState(false)
  const [showAcceptWorkForm, setShowAcceptWorkForm] = useState(false)

  useEffect(() => {
    setShowAcceptWorkForm(false)
  }, [demand?.id])

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close()
    }
  }

  const handleCloseClick = (event) => {
    event.currentTarget.closest('dialog')?.close()
  }

  const toggleCommentForm = (proposalId) => {
    setOpenCommentFor((current) => (current === proposalId ? null : proposalId))
    setCommentErrors((prev) => ({ ...prev, [proposalId]: undefined }))
  }

  const cancelCommentForm = (proposalId) => {
    setOpenCommentFor(null)
    setCommentDrafts((prev) => ({ ...prev, [proposalId]: '' }))
    setCommentErrors((prev) => ({ ...prev, [proposalId]: undefined }))
  }

  const handleCommentChange = (proposalId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [proposalId]: value }))
    setCommentErrors((prev) => ({ ...prev, [proposalId]: undefined }))
  }

  const handleRequestChangesSubmit = async (proposalId) => {
    const comment = (commentDrafts[proposalId] ?? '').trim()

    if (!comment) {
      setCommentErrors((prev) => ({ ...prev, [proposalId]: 'Komentář je povinný' }))
      return
    }
    if (comment.length > COMMENT_MAX_LENGTH) {
      setCommentErrors((prev) => ({ ...prev, [proposalId]: `Komentář nesmí překročit ${COMMENT_MAX_LENGTH} znaků` }))
      return
    }

    setSubmittingId(proposalId)
    try {
      await onRequestChanges?.(proposalId, comment)
      cancelCommentForm(proposalId)
    } catch (submitError) {
      const normalized = submitError?.fieldErrors ? normalizeFieldErrors(submitError.fieldErrors) : {}
      setCommentErrors((prev) => ({
        ...prev,
        [proposalId]: normalized.comment || submitError?.message || 'Žádost o úpravy se nepodařila',
      }))
    } finally {
      setSubmittingId(null)
    }
  }

  // vlastník už vybral - poptávka opustila NOVA (přijetím nebo přechodem do SCHVALENA/ZAPLACENA)
  const hasDecision =
    proposals.some((proposal) => proposal.status === 'SCHVALEN') ||
    demand?.status === 'SCHVALENA' ||
    demand?.status === 'ZAPLACENA'

  const mainProposals = hasDecision
    ? proposals.filter((proposal) => proposal.status !== 'ZAMITNUT')
    : proposals
  const rejectedProposals = hasDecision
    ? proposals.filter((proposal) => proposal.status === 'ZAMITNUT')
    : []

  // přijatý návrh vždy první, zbytek beze změny pořadí
  const sortedMainProposals = hasDecision
    ? [...mainProposals].sort((a, b) => {
        if (a.status === 'SCHVALEN') return -1
        if (b.status === 'SCHVALEN') return 1
        return 0
      })
    : mainProposals

  const renderProposalCard = (proposal, { accepted = false, muted = false } = {}) => {
    const cardClassName = [
      'card',
      'card--proposal',
      accepted && 'card--proposal-accepted',
      muted && 'card--proposal-muted',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <li className="demand-list__item" key={proposal.id}>
        <div className={cardClassName}>
          <div className="card__content">
            <div className="card__header">
              <strong>
                {proposal.workerFirstName} {proposal.workerLastName}
              </strong>
              <Chip variant="status" status={proposalStatusChipKeys[proposal.status]}>
                {proposalStatusLabels[proposal.status] ?? proposal.status}
              </Chip>
            </div>

            <p className="card__price">{proposal.price} Kč</p>

            {proposal.workerBio && <p className="card__text">{proposal.workerBio}</p>}

            {proposal.description && <p className="card__text">{proposal.description}</p>}

            {proposal.status === 'NOVY' && (
              <div className="card__actions">
                <Button variant="green" type="button" onClick={() => onAccept?.(proposal.id)}>
                  Přijmout
                </Button>
                <Button variant="outline" type="button" onClick={() => onReject?.(proposal.id)}>
                  Odmítnout
                </Button>
                <Button variant="transparent" type="button" onClick={() => toggleCommentForm(proposal.id)}>
                  Požádat o úpravy
                </Button>
              </div>
            )}

            {proposal.status === 'NOVY' && openCommentFor === proposal.id && (
              <>
                <Field
                  id={`proposal-comment-${proposal.id}`}
                  name="comment"
                  label="Komentář k žádosti o úpravy"
                  type="textarea"
                  placeholder="Popište, co je potřeba upravit..."
                  value={commentDrafts[proposal.id] ?? ''}
                  onChange={(event) => handleCommentChange(proposal.id, event.target.value)}
                  error={commentErrors[proposal.id]}
                />

                <div className="card__actions">
                  <Button
                    type="button"
                    onClick={() => handleRequestChangesSubmit(proposal.id)}
                    disabled={submittingId === proposal.id}
                  >
                    {submittingId === proposal.id ? 'Odesílání…' : 'Odeslat žádost'}
                  </Button>
                  <Button variant="outline" type="button" onClick={() => cancelCommentForm(proposal.id)}>
                    Zrušit
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </li>
    )
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

      {demand?.workReport && (
        <div className="offer-modal__aside">
          <h4 className="offer-modal__subtitle h4">Report zahradníka</h4>
          <p className="offer-modal__text">{demand.workReport.description}</p>
          <p className="offer-modal__text">
            <small>{new Date(demand.workReport.createdAt).toLocaleDateString('cs-CZ')}</small>
          </p>
          {demand.workReport.photoUrls?.length > 0 && (
            <p className="offer-modal__text">
              {demand.workReport.photoUrls.map((url, index) => (
                <span key={url}>
                  {index > 0 && ', '}
                  <a href={url} target="_blank" rel="noreferrer">
                    Foto {index + 1}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {demand?.status === 'PRACE_DOKONCENY' && !showAcceptWorkForm && (
        <Button type="button" onClick={() => setShowAcceptWorkForm(true)}>
          Přijmout práci
        </Button>
      )}

      {demand?.status === 'PRACE_DOKONCENY' && showAcceptWorkForm && (
        <AcceptWorkForm
          onSubmit={onAcceptWork}
          onCancel={() => setShowAcceptWorkForm(false)}
          error={acceptWorkError}
          serverFieldErrors={acceptWorkFieldErrors}
        />
      )}

      {demand?.status === 'PRACE_SCHVALENY' && demand?.review && (
        <div className="offer-modal__aside">
          <h4 className="offer-modal__subtitle h4">Vaše hodnocení</h4>
          <RatingStars value={demand.review.rating} readOnly />
          {demand.review.comment && <p className="offer-modal__text">{demand.review.comment}</p>}
        </div>
      )}

      {isLoading && <p>Načítání…</p>}
      {!isLoading && error && <p className="field__error">{error}</p>}
      {!isLoading && !error && proposals.length === 0 && <p>Zatím žádné návrhy.</p>}

      {!isLoading && !error && proposals.length > 0 && (
        <>
          <ul className="demand-list__items">
            {sortedMainProposals.map((proposal) =>
              renderProposalCard(proposal, { accepted: hasDecision && proposal.status === 'SCHVALEN' }),
            )}
          </ul>

          {hasDecision && rejectedProposals.length > 0 && (
            <div className="demand-list__rejected">
              <button
                type="button"
                className="demand-list__rejected-toggle"
                onClick={() => setShowRejected((prev) => !prev)}
                aria-expanded={showRejected}
              >
                {showRejected ? 'Skrýt' : 'Zobrazit'} zamítnuté nabídky ({rejectedProposals.length})
              </button>

              {showRejected && (
                <ul className="demand-list__items demand-list__rejected-list">
                  {rejectedProposals.map((proposal) => renderProposalCard(proposal, { muted: true }))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </dialog>
  )
})
