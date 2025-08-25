import React from 'react';
// import { 
//     BarChart, 
//     Bar, 
//     XAxis, 
//     YAxis, 
//     CartesianGrid, 
//     Tooltip, 
//     Legend, 
//     ResponsiveContainer 
// } from 'recharts';

// Define a TypeScript interface for the data points the chart expects.
// This ensures type safety and provides excellent autocompletion.
interface ChartData {
    name: string;
    'Tasks Completed': number;
    'Prospects Added': number;
    'Projects Started': number;
}

// The component's props are typed to expect an array of ChartData objects.
interface PerformanceChartProps {
    data: ChartData[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
    return (
        // ResponsiveContainer makes the chart fill its parent div,
        // making it adaptable to different screen sizes.
        // <ResponsiveContainer width="100%" height={350}>
        //     <BarChart
        //         data={data}
        //         margin={{
        //             top: 5,
        //             right: 30,
        //             left: 0,
        //             bottom: 5,
        //         }}
        //     >
        //         {/* The faint grid lines in the background */}
        //         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                
        //         {/* The horizontal axis (labels like 'January', 'Previous') */}
        //         <XAxis dataKey="name" tickLine={false} axisLine={false} />
                
        //         {/* The vertical axis (the numbers 0, 20, 40...) */}
        //         <YAxis tickLine={false} axisLine={false} />
                
        //         {/* The popup that appears when you hover over the bars */}
        //         <Tooltip cursor={{fill: 'transparent'}} />
                
        //         {/* The key at the bottom of the chart */}
        //         <Legend iconType="circle" />
                
        //         {/* Each <Bar> component represents one set of bars on the chart. */}
        //         {/* You can easily change the colors here to match your theme. */}
        //         <Bar dataKey="Tasks Completed" fill="#8884d8" radius={[4, 4, 0, 0]} />
        //         <Bar dataKey="Prospects Added" fill="#FA8072" radius={[4, 4, 0, 0]} />
        //         <Bar dataKey="Projects Started" fill="#80DEEA" radius={[4, 4, 0, 0]} />
        //     </BarChart>
        // </ResponsiveContainer>
        <div>PerformanceChart</div>
    );
};