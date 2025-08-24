import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  LineChart,
  PieChart,
  BarChart3,
  MapPin,
  Activity,
  Users,
  Target,
} from "lucide-react";

const AnalyticsGuideComponent = () => {
  const EnglishContent = () => (
    <div className='space-y-8 mt-6'>
      {/* Daily Trends Chart */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <LineChart className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Daily Trends Chart</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>What it shows:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            Daily revenue and order trends over your selected time period with
            dual Y-axes for easy comparison. Only includes active orders
            (processing, completed, shipped).
          </p>
          <h4 className='font-medium mb-2'>Calculations:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>Daily Revenue:</strong> Sum of (totalPrice - discount)
              for active orders each day
            </li>
            <li>
              • <strong>Daily Orders:</strong> Count of active orders placed
              each day
            </li>
            <li>
              • <strong>Trend Analysis:</strong> Line slopes indicate growth or
              decline patterns
            </li>
            <li>
              • <strong>Growth Comparison:</strong> Current period vs. previous
              period of equal length
            </li>
          </ul>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <PieChart className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Order Status Distribution</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>What it shows:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            Percentage breakdown of all orders by their current status
            (Processing, Completed, Shipped, Cancelled, Failed).
          </p>
          <h4 className='font-medium mb-2'>Calculations:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>Percentage:</strong> (Status Count / Total Orders) × 100
            </li>
            <li>
              • <strong>Colors:</strong> Green (Completed), Blue (Shipped),
              Orange (Processing), Red (Cancelled/Failed)
            </li>
            <li>
              • <strong>Health Metric:</strong> Higher completion rates indicate
              better fulfillment
            </li>
          </ul>
        </div>
      </div>

      {/* Top Products Revenue */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <BarChart3 className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Top Products by Revenue</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>What it shows:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            Your highest-performing products ranked by total revenue generated
            in the selected period. Only includes active orders (processing,
            completed, shipped).
          </p>
          <h4 className='font-medium mb-2'>Calculations:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>Product Revenue:</strong> Sum of totalPrice for each
              product from active orders
            </li>
            <li>
              • <strong>Ranking:</strong> Products sorted by total revenue
              (highest to lowest)
            </li>
            <li>
              • <strong>Performance Metrics:</strong> Revenue per unit, average
              order size included
            </li>
          </ul>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <MapPin className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Geographic Distribution</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>What it shows:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            Revenue breakdown by delivery locations (District, Division) showing
            your market penetration across different areas.
          </p>
          <h4 className='font-medium mb-2'>Calculations:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>Location Revenue:</strong> Sum of (totalPrice -
              discount) for each delivery area
            </li>
            <li>
              • <strong>Market Share:</strong> Location Revenue / Total Revenue
              × 100
            </li>
            <li>
              • <strong>Growth Opportunity:</strong> Identifies underperforming
              regions for expansion
            </li>
          </ul>
        </div>
      </div>

      {/* Time Activity Heatmap */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Activity className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Time Activity Heatmap</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>What it shows:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            Order activity intensity across different hours of the day and days
            of the week using color intensity.
          </p>
          <h4 className='font-medium mb-2'>Calculations:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>Activity Data:</strong> Raw order count per hour and day
              of week
            </li>
            <li>
              • <strong>Color Intensity:</strong> Frontend normalizes data to
              0-100 scale for color mapping
            </li>
            <li>
              • <strong>Pattern Recognition:</strong> Helps identify peak
              ordering times for inventory planning
            </li>
          </ul>
        </div>
      </div>

      {/* Customer Segments */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Users className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Customer Segments</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>What it shows:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            Customer distribution across value tiers based on their total
            spending and order behavior.
          </p>
          <h4 className='font-medium mb-2'>Calculations:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>VIP Customers:</strong> Total spending &gt; ৳10,000
              (Purple)
            </li>
            <li>
              • <strong>Premium Customers:</strong> Total spending &gt; ৳5,000
              but ≤ ৳10,000 (Blue)
            </li>
            <li>
              • <strong>Loyal Customers:</strong> More than 5 orders regardless
              of amount (Green)
            </li>
            <li>
              • <strong>Regular Customers:</strong> All others (Gray)
            </li>
            <li>
              • <strong>Segment Value:</strong> Percentage of total customer
              base in each tier
            </li>
          </ul>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Target className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Key Performance Indicators</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>Essential Calculations:</h4>
          <ul className='text-sm text-muted-foreground space-y-2'>
            <li>
              • <strong>Average Order Value (AOV):</strong> Total Revenue ÷
              Number of Active Orders
            </li>
            <li>
              • <strong>Return Rate:</strong> (Returns Value ÷ Total Sales) ×
              100
            </li>
            <li>
              • <strong>Profit Margin:</strong> ((Revenue - Purchases - Returns)
              ÷ Revenue) × 100
            </li>
            <li>
              • <strong>Growth Rate:</strong> ((Current Period - Previous
              Period) ÷ Previous Period) × 100
            </li>
            <li>
              • <strong>Collection Rate:</strong> Paid Amount ÷ Total Revenue ×
              100
            </li>
            <li>
              • <strong>Active Orders:</strong> Only processing, completed, and
              shipped orders counted
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const BengaliContent = () => (
    <div className='space-y-8 mt-6'>
      {/* Daily Trends Chart */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <LineChart className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>দৈনিক ট্রেন্ড চার্ট</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>কী দেখায়:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            আপনার নির্বাচিত সময়কালের দৈনিক আয় এবং অর্ডারের ট্রেন্ড দুটি
            Y-অক্ষের সাহায্যে সহজ তুলনার জন্য। শুধুমাত্র সক্রিয় অর্ডারগুলি
            অন্তর্ভুক্ত (প্রসেসিং, সম্পন্ন, পাঠানো)।
          </p>
          <h4 className='font-medium mb-2'>গণনা:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>দৈনিক আয়:</strong> প্রতিদিন সক্রিয় অর্ডারের (মোট মূল্য
              - ছাড়) এর যোগফল
            </li>
            <li>
              • <strong>দৈনিক অর্ডার:</strong> প্রতিদিন দেওয়া সক্রিয় অর্ডারের
              সংখ্যা
            </li>
            <li>
              • <strong>ট্রেন্ড বিশ্লেষণ:</strong> লাইনের ঢাল বৃদ্ধি বা হ্রাসের
              প্যাটার্ন নির্দেশ করে
            </li>
            <li>
              • <strong>বৃদ্ধির তুলনা:</strong> বর্তমান সময়কাল বনাম সমান
              দৈর্ঘ্যের পূর্ববর্তী সময়কাল
            </li>
          </ul>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <PieChart className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>অর্ডার স্ট্যাটাস বণ্টন</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>কী দেখায়:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            বর্তমান স্ট্যাটাস অনুযায়ী সমস্ত অর্ডারের শতকরা ভাগ (প্রসেসিং,
            সম্পন্ন, পাঠানো, বাতিল, ব্যর্থ)।
          </p>
          <h4 className='font-medium mb-2'>গণনা:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>শতাংশ:</strong> (স্ট্যাটাস সংখ্যা / মোট অর্ডার) × ১০০
            </li>
            <li>
              • <strong>রং:</strong> সবুজ (সম্পন্ন), নীল (পাঠানো), কমলা
              (প্রসেসিং), লাল (বাতিল/ব্যর্থ)
            </li>
            <li>
              • <strong>স্বাস্থ্য মেট্রিক:</strong> উচ্চ সম্পন্নের হার ভাল পূরণ
              নির্দেশ করে
            </li>
          </ul>
        </div>
      </div>

      {/* Top Products Revenue */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <BarChart3 className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>আয় অনুযায়ী শীর্ষ পণ্য</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>কী দেখায়:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            নির্বাচিত সময়কালে মোট আয়ের ভিত্তিতে র‍্যাঙ্ক করা আপনার সর্বোচ্চ
            কার্যকর পণ্যগুলি। শুধুমাত্র সক্রিয় অর্ডার অন্তর্ভুক্ত (প্রসেসিং,
            সম্পন্ন, পাঠানো)।
          </p>
          <h4 className='font-medium mb-2'>গণনা:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>পণ্যের আয়:</strong> সক্রিয় অর্ডার থেকে প্রতিটি পণ্যের
              মোট মূল্যের যোগফল
            </li>
            <li>
              • <strong>র‍্যাঙ্কিং:</strong> মোট আয় অনুযায়ী পণ্য সাজানো
              (সর্বোচ্চ থেকে সর্বনিম্ন)
            </li>
            <li>
              • <strong>কার্যক্রম মেট্রিক:</strong> প্রতি ইউনিট আয়, গড় অর্ডার
              সাইজ অন্তর্ভুক্ত
            </li>
          </ul>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <MapPin className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>ভৌগোলিক বণ্টন</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>কী দেখায়:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            ডেলিভারি অবস্থান (জেলা, বিভাগ) অনুযায়ী আয়ের ভাঙ্গন যা বিভিন্ন
            এলাকায় আপনার বাজার অনুপ্রবেশ দেখায়।
          </p>
          <h4 className='font-medium mb-2'>গণনা:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>অবস্থানের আয়:</strong> প্রতিটি ডেলিভারি এলাকার জন্য
              (মোট মূল্য - ছাড়) এর যোগফল
            </li>
            <li>
              • <strong>বাজার শেয়ার:</strong> অবস্থানের আয় / মোট আয় × ১০০
            </li>
            <li>
              • <strong>বৃদ্ধির সুযোগ:</strong> সম্প্রসারণের জন্য কম কার্যকর
              অঞ্চলগুলি চিহ্নিত করে
            </li>
          </ul>
        </div>
      </div>

      {/* Time Activity Heatmap */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Activity className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>সময় কার্যক্রম হিটম্যাপ</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>কী দেখায়:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            দিনের বিভিন্ন ঘন্টা এবং সপ্তাহের দিনগুলিতে অর্ডার কার্যক্রমের
            তীব্রতা রঙের তীব্রতা ব্যবহার করে।
          </p>
          <h4 className='font-medium mb-2'>গণনা:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>কার্যক্রম ডেটা:</strong> প্রতি ঘন্টা এবং সপ্তাহের দিন
              অনুযায়ী অর্ডারের কাঁচা সংখ্যা
            </li>
            <li>
              • <strong>রঙের তীব্রতা:</strong> ফ্রন্টএন্ড রঙ ম্যাপিংয়ের জন্য
              ডেটাকে ০-১০০ স্কেলে স্বাভাবিক করে
            </li>
            <li>
              • <strong>প্যাটার্ন সনাক্তকরণ:</strong> ইনভেন্টরি পরিকল্পনার জন্য
              শীর্ষ অর্ডার সময় চিহ্নিত করতে সহায়তা করে
            </li>
          </ul>
        </div>
      </div>

      {/* Customer Segments */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Users className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>গ্রাহক বিভাগ</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>কী দেখায়:</h4>
          <p className='text-sm text-muted-foreground mb-3'>
            তাদের মোট খরচ এবং অর্ডার আচরণের ভিত্তিতে মূল্য স্তর জুড়ে গ্রাহক
            বণ্টন।
          </p>
          <h4 className='font-medium mb-2'>গণনা:</h4>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>
              • <strong>ভিআইপি গ্রাহক:</strong> মোট খরচ &gt; ৳১০,০০০ (বেগুনি)
            </li>
            <li>
              • <strong>প্রিমিয়াম গ্রাহক:</strong> মোট খরচ &gt; ৳৫,০০০ কিন্তু ≤
              ৳১০,০০০ (নীল)
            </li>
            <li>
              • <strong>অনুগত গ্রাহক:</strong> পরিমাণ নির্বিশেষে ৫টির বেশি
              অর্ডার (সবুজ)
            </li>
            <li>
              • <strong>নিয়মিত গ্রাহক:</strong> অন্য সবাই (ধূসর)
            </li>
            <li>
              • <strong>বিভাগের মান:</strong> প্রতিটি স্তরে মোট গ্রাহক বেসের
              শতাংশ
            </li>
          </ul>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Target className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>মূল কর্মক্ষমতা সূচক</h3>
        </div>
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>অপরিহার্য গণনা:</h4>
          <ul className='text-sm text-muted-foreground space-y-2'>
            <li>
              • <strong>গড় অর্ডার মূল্য (AOV):</strong> মোট আয় ÷ সক্রিয়
              অর্ডারের সংখ্যা
            </li>
            <li>
              • <strong>ফেরতের হার:</strong> (ফেরত মূল্য ÷ মোট বিক্রয়) × ১০০
            </li>
            <li>
              • <strong>লাভের মার্জিন:</strong> ((আয় - ক্রয় - ফেরত) ÷ আয়) ×
              ১০০
            </li>
            <li>
              • <strong>বৃদ্ধির হার:</strong> ((বর্তমান সময়কাল - পূর্ববর্তী
              সময়কাল) ÷ পূর্ববর্তী সময়কাল) × ১০০
            </li>
            <li>
              • <strong>সংগ্রহের হার:</strong> পরিশোধিত পরিমাণ ÷ মোট আয় × ১০০
            </li>
            <li>
              • <strong>সক্রিয় অর্ডার:</strong> শুধুমাত্র প্রসেসিং, সম্পন্ন,
              এবং পাঠানো অর্ডার গণনা করা হয়
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className='w-full max-w-sm md:max-w-4xl md:mx-auto'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold mb-2'>Analytics Dashboard Guide</h2>
        <p className='text-muted-foreground'>
          Comprehensive explanation of all analytics charts and metrics
        </p>
      </div>

      <Tabs defaultValue='english' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='english'>English</TabsTrigger>
          <TabsTrigger value='bengali'>বাংলা</TabsTrigger>
        </TabsList>

        <TabsContent value='english' className='mt-6'>
          <EnglishContent />
        </TabsContent>

        <TabsContent value='bengali' className='mt-6'>
          <BengaliContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsGuideComponent;
