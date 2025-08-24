import {
  Settings,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useSettings } from "../contexts/SettingsContext";

const themeOptions = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    color: "bg-white",
    description: "Classic light theme",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    color: "bg-gray-900",
    description: "Dark mode for low-light",
  },
  {
    value: "blue",
    label: "Ocean Blue",
    icon: Palette,
    color: "bg-blue-500",
    description: "Professional blue theme",
  },
  {
    value: "green",
    label: "Forest Green",
    icon: Palette,
    color: "bg-green-500",
    description: "Nature-inspired green",
  },
  {
    value: "purple",
    label: "Royal Purple",
    icon: Palette,
    color: "bg-purple-500",
    description: "Elegant purple theme",
  },
  {
    value: "orange",
    label: "Sunset Orange",
    icon: Palette,
    color: "bg-orange-500",
    description: "Warm orange theme",
  },
] as const;

export function SettingsPanel() {
  const { layoutType, setLayoutType, theme, setTheme } = useSettings();

  return (
    <Sheet>
      <SheetTrigger className='p-0' asChild>
        <Button
          variant='ghost'
          className='h-8 p-0 md:pl-[2%] bg-sidebar w-full text-left flex justify-start items-center gap-2'>
          <Settings className='h-6 w-6' />
          <span className='hidden md:inline'>Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-auto'>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your dashboard experience
          </SheetDescription>
        </SheetHeader>
        <div className='grid gap-6 py-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Layout</CardTitle>
              <CardDescription>
                Choose your preferred dashboard layout
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <RadioGroup
                value={layoutType}
                onValueChange={(value) =>
                  setLayoutType(value as "modern" | "legacy")
                }
                className='space-y-3'>
                <div className='flex items-center space-x-3 rounded-md border p-3 hover:bg-accent'>
                  <RadioGroupItem value='modern' id='modern' />
                  <div className='flex-1'>
                    <Label htmlFor='modern' className='cursor-pointer'>
                      <div className='flex items-center gap-2'>
                        <Monitor className='h-4 w-4' />
                        <span className='font-medium'>Modern Sidebar</span>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>
                        New sidebar layout with collapsible navigation
                      </p>
                    </Label>
                  </div>
                </div>
                <div className='flex items-center space-x-3 rounded-md border p-3 hover:bg-accent'>
                  <RadioGroupItem value='legacy' id='legacy' />
                  <div className='flex-1'>
                    <Label htmlFor='legacy' className='cursor-pointer'>
                      <div className='flex items-center gap-2'>
                        <Smartphone className='h-4 w-4' />
                        <span className='font-medium'>Classic Layout</span>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Original layout with fixed sidebar
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {layoutType === "modern" && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Sidebar Theme</CardTitle>
                <CardDescription>
                  Choose your preferred sidebar color (modern layout only)
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <RadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as any)}
                  className='grid grid-cols-2 gap-3'>
                  {themeOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <div
                        key={option.value}
                        className='flex items-center space-x-3 rounded-md border p-3 hover:bg-accent'>
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                        />
                        <div className='flex-1'>
                          <Label
                            htmlFor={option.value}
                            className='cursor-pointer'>
                            <div className='flex items-center gap-2'>
                              <div className='flex items-center gap-1'>
                                <div
                                  className={`w-3 h-3 rounded-full ${option.color} border border-gray-200`}></div>
                                <IconComponent className='h-3 w-3' />
                              </div>
                              <span className='font-medium text-sm'>
                                {option.label}
                              </span>
                            </div>
                            <p className='text-xs text-muted-foreground mt-1'>
                              {option.description}
                            </p>
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
