import { CSSProperties } from "react";

export default function Selector(props: {
	possibleValues: any[];
	initialValue: any;
	supplementary: string;
	// eslint-disable-next-line no-unused-vars
	onSelectHandler: (amount: any) => any;
	className?: string;
	style?: CSSProperties;
}) {
	return (
		<div className={`select is-normal ${props.className}`} style={props.style}>
			<select defaultValue={props.initialValue} style={props.style}>
				{props.possibleValues.map((optionValue) => {
					return (
						<option
							key={`option-${optionValue}`}
							value={optionValue}
							onClick={() => props.onSelectHandler(optionValue)}
						>
							{optionValue} {props.supplementary}
						</option>
					);
				})}
			</select>
		</div>
	);
}
