import { SearchX, PlusCircle } from 'lucide-react'

interface SellerListingsEmptyProps {
  variant: 'no-results' | 'no-listings'
}

export default function SellerListingsEmpty({ variant }: SellerListingsEmptyProps) {
  if (variant === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <SearchX size={40} className="text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold text-foreground">No matching listings</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Try adjusting your search terms or clearing the query to see all listings.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <PlusCircle size={40} className="text-muted-foreground/40 mb-3" />
      <h3 className="text-base font-semibold text-foreground">No listings yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Create your first deal room to start managing your dispositions.
      </p>
      <button className="mt-4 rounded-lg bg-mode-sell px-4 py-2 text-sm font-medium text-white hover:bg-mode-sell/90 transition-colors">
        Create Listing
      </button>
    </div>
  )
}
