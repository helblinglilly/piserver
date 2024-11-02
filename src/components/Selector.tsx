import React, { CSSProperties } from "react";

export default function Selector(props: {
	possibleValues: number[];
	initialValue: number;
	supplementary: string;
	onSelectHandler: (_amount: number) => void;
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
							onClick={() => {
								props.onSelectHandler(optionValue);
							}}
						>
							{optionValue} {props.supplementary}
						</option>
					);
				})}
			</select>
		</div>
	);
}
