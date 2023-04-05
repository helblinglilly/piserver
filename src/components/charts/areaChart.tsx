import React from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";

const ExampleAreaChart = (props: { data: any[] }) => {
	return (
		<AreaChart
			width={600}
			height={400}
			data={props.data}
			margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
		>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="date" />
			<YAxis />
			<Tooltip />
			<Area type="monotone" dataKey="kWh" stroke="#8884d8" fill="#8884d8" />
		</AreaChart>
	);
};

export default ExampleAreaChart;
