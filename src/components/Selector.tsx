export default function Selector(props: {
	possibleValues: any[];
	initialValue: any;
	supplementary: string;
	// eslint-disable-next-line no-unused-vars
	onSelectHandler: (amount: any) => any;
}) {
	return (
		<div className="select is-normal">
			<select defaultValue={props.initialValue}>
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
