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
import { Ellipsis } from "lucide-react";
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
import { toast } from "react-toastify";
const DATE_FORMAT = "DD/MM/YYYY HH:mm";

const CampaignList = () => {
  const navigate = useNavigate();
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
      fetchCampaignList();
    }
  };

  const renderDeleteDrawerView = () => {
    return (
      <Drawer>
        <DrawerTrigger>
          <button ref={deleteBtnRef} className="hidden">
            delete
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="mx-auto">
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="container">
            <div className="flex justify-center items-center gap-6">
              <DrawerClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleCampaignDelete(selectedCamIdToDelete);
                  }}
                >
                  I'm Sure
                </Button>
              </DrawerClose>
              <DrawerClose>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCamIdToDelete("")}
                >
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
    if (!campaigns || campaigns.length < 1) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            <Badge variant={"secondary"}>No Campaign Found</Badge>
          </TableCell>
        </TableRow>
      );
    } else {
      return campaigns
        .filter(
          (c: ICampaign) => c?.title.includes(query) || c?.id?.includes(query)
        )
        .map((cam: ICampaign, index: number) => (
          <TableRow>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>{cam?.title}</TableCell>
            <TableCell>{cam?.products?.length ?? 0}</TableCell>
            <TableCell>{dayjs(cam?.startDate).format(DATE_FORMAT)}</TableCell>
            <TableCell>{dayjs(cam?.endDate).format(DATE_FORMAT)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => navigate(`/campaign/update/${cam?.id}`)}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      if (!!deleteBtnRef) {
                        setSelectedCamIdToDelete(cam?.id);
                        deleteBtnRef?.current?.click();
                      }
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
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
            <TableHead className="w-[100px] truncate text-left">
              Title
            </TableHead>
            <TableHead>Total Products</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderSingleCampaign()}</TableBody>
      </Table>
    );
  };
  return (
    <MainView title="Campaign">
      <div className="w-full sm:w-[95vw] my-2">
        {!loading && (
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Input
                  className="w-1/2"
                  type="text"
                  placeholder="Search (id, title)..."
                  onChange={(e) => setQuery(e.target.value ?? "")}
                />
                <Button onClick={() => navigate("/campaign/create")}>
                  Create New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>{renderCampaignList()}</CardContent>
          </Card>
        )}

        {loading && (
          <Badge variant={"outline"} className="mx-auto mt-10">
            Loading...
          </Badge>
        )}
        {renderDeleteDrawerView()}
      </div>
    </MainView>
  );
};

export default CampaignList;
