import { useEffect, useRef, useState } from "react";
import useCampaign from "./hooks/useCampaign";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { ICampaign } from "./interface";
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Ellipsis, Plus } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { useIsMobile } from "../../hooks/use-mobile";
import MobileCampaignCard from "./components/MobileCampaignCard";
import MobileCampaignHeader from "./components/MobileCampaignHeader";
import MobileCampaignEmpty from "./components/MobileCampaignEmpty";
const DATE_FORMAT = "DD/MM/YYYY HH:mm";

const CampaignList = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const { fetchCampaignList, deleteACampaign } = useCampaign();
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCamIdToDelete, setSelectedCamIdToDelete] = useState("");

  const deleteBtnRef = useRef<any>(null);

  useEffect(() => {
    const getCampaigns = async () => {
      setLoading(true);
      const list = await fetchCampaignList();
      setCampaigns(list);
      setLoading(false);
    };
    getCampaigns();

    //eslint-disable-next-line
  }, []);
  const handleCampaignDelete = async (id: string) => {
    const isDeleted = await deleteACampaign(id);
    if (isDeleted) {
      toast.success("Campaign Deleted Successfully");
      const list = await fetchCampaignList();
      setCampaigns(list);
    }
  };

  const handleUpdateCampaign = (id: string) => {
    navigate(`/campaign/update/${id}`);
  };

  const handleCreateCampaign = () => {
    navigate("/campaign/create");
  };

  const filteredCampaigns = campaigns.filter(
    (c: ICampaign) => c?.title.includes(query) || c?.id?.includes(query)
  );

  const renderDeleteDrawerView = () => {
    return (
      <Drawer>
        <DrawerTrigger>
          <button ref={deleteBtnRef} className='hidden'>
            delete
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className='mx-auto'>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className='container'>
            <div className='flex justify-center items-center gap-6'>
              <DrawerClose>
                <Button
                  variant='destructive'
                  onClick={() => {
                    handleCampaignDelete(selectedCamIdToDelete);
                  }}>
                  I'm Sure
                </Button>
              </DrawerClose>
              <DrawerClose>
                <Button
                  variant='outline'
                  onClick={() => setSelectedCamIdToDelete("")}>
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };
  const renderSingleCampaign = () => {
    if (!filteredCampaigns || filteredCampaigns.length < 1) {
      return (
        <TableRow>
          <TableCell colSpan={6} className='text-center'>
            <Badge variant={"secondary"}>No Campaign Found</Badge>
          </TableCell>
        </TableRow>
      );
    } else {
      return filteredCampaigns.map((cam: ICampaign, index: number) => (
        <TableRow>
          <TableCell className='font-medium'>{index + 1}</TableCell>
          <TableCell>{cam?.title}</TableCell>
          <TableCell>{cam?.products?.length ?? 0}</TableCell>
          <TableCell>
            {!cam?.deliveryDiscountType || cam?.deliveryDiscountType === "none" ? (
              <Badge variant='secondary'>None</Badge>
            ) : cam?.deliveryDiscountType === "free" ? (
              <Badge className='bg-green-100 text-green-800 border-green-300'>
                Free Delivery
              </Badge>
            ) : cam?.deliveryDiscountType === "percentage" ? (
              <Badge className='bg-blue-100 text-blue-800 border-blue-300'>
                {cam?.deliveryDiscountAmount}% off
              </Badge>
            ) : cam?.deliveryDiscountType === "fixed" ? (
              <Badge className='bg-orange-100 text-orange-800 border-orange-300'>
                {cam?.deliveryDiscountAmount} off
              </Badge>
            ) : (
              <Badge variant='secondary'>None</Badge>
            )}
          </TableCell>
          <TableCell>{dayjs(cam?.startDate).format(DATE_FORMAT)}</TableCell>
          <TableCell>{dayjs(cam?.endDate).format(DATE_FORMAT)}</TableCell>
          {hasSomePermissionsForPage("campaign", ["edit", "delete"]) && (
            <TableCell className='text-right'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {hasRequiredPermission("campaign", "edit") && (
                    <DropdownMenuItem
                      onClick={() => handleUpdateCampaign(cam?.id)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {hasRequiredPermission("campaign", "delete") && (
                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => {
                        if (!!deleteBtnRef) {
                          setSelectedCamIdToDelete(cam?.id);
                          deleteBtnRef?.current?.click();
                        }
                      }}>
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          )}
        </TableRow>
      ));
    }
  };
  const renderCampaignList = () => {
    return (
      <Table>
        <TableCaption>A list of your recent campaigns.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead className='w-[100px] truncate text-left'>
              Title
            </TableHead>
            <TableHead>Total Products</TableHead>
            <TableHead>Delivery Discount</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            {hasSomePermissionsForPage("campaign", ["edit", "delete"]) && (
              <TableHead>Action</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>{renderSingleCampaign()}</TableBody>
      </Table>
    );
  };
  return (
    <MainView title='Campaign'>
      <div className='w-full my-2'>
        {loading && (
          <div className="flex justify-center py-10">
            <Badge variant={"outline"} className='mx-auto'>
              Loading...
            </Badge>
          </div>
        )}

        {!loading && isMobile ? (
          /* Mobile View */
          <div className="space-y-3 pb-safe">
            <MobileCampaignHeader
              searchValue={query}
              onSearchChange={(value) => setQuery(value)}
            />

            {filteredCampaigns.length === 0 ? (
              <MobileCampaignEmpty
                searchValue={query}
                onCreateCampaign={handleCreateCampaign}
              />
            ) : (
              <div className="space-y-3">
                {filteredCampaigns.map((campaign: ICampaign, index: number) => (
                  <MobileCampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={index}
                    handleUpdateCampaign={handleUpdateCampaign}
                    deleteExistingCampaign={handleCampaignDelete}
                  />
                ))}
              </div>
            )}

            {/* Floating Action Button */}
            {hasRequiredPermission("campaign", "create") && (
              <Button
                onClick={handleCreateCampaign}
                className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white z-50 flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </Button>
            )}
          </div>
        ) : (
          /* Desktop View */
          !loading && (
            <Card className='w-full'>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <Input
                    className='w-1/2'
                    type='text'
                    placeholder='Search (id, title)...'
                    onChange={(e) => setQuery(e.target.value ?? "")}
                  />
                  {hasRequiredPermission("campaign", "create") && (
                    <Button onClick={handleCreateCampaign}>
                      Create New Campaign
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>{renderCampaignList()}</CardContent>
            </Card>
          )
        )}

        {hasRequiredPermission("campaign", "delete") &&
          renderDeleteDrawerView()}
      </div>
    </MainView>
  );
};

export default CampaignList;
