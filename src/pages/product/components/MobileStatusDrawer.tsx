import { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { ListFilter, X } from "lucide-react"

interface TabOption {
  value: string
  label: string
  badgeClass: string
}

interface MobileStatusDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (tab: string) => void
  options: TabOption[]
  counts: Record<string, number>
  selectedTab: string
  isInactiveView?: boolean
}

export function MobileStatusDrawer({
  open,
  onOpenChange,
  onSelect,
  options,
  counts,
  selectedTab,
  isInactiveView = false,
}: MobileStatusDrawerProps) {
  const handleSelect = (value: string) => {
    onSelect(value)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-2xl max-h-[70vh]">
        <DrawerHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className={`h-5 w-5 ${isInactiveView ? "text-orange-500" : "text-indigo-600"}`} />
            <div>
              <DrawerTitle className="text-base font-semibold">Filter by Status</DrawerTitle>
              <DrawerDescription className="text-xs">Select a status to filter products</DrawerDescription>
            </div>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto max-h-[55vh]">
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = selectedTab === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isSelected
                      ? isInactiveView
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-zinc-600 hover:bg-zinc-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? isInactiveView
                          ? "border-orange-500 bg-orange-500"
                          : "border-indigo-500 bg-indigo-500"
                        : "border-zinc-300"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span>{option.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? isInactiveView
                        ? "bg-orange-100 text-orange-700"
                        : "bg-indigo-100 text-indigo-700"
                      : option.badgeClass
                  }`}>
                    {counts[option.value]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <DrawerFooter className="pt-0 pb-6">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
